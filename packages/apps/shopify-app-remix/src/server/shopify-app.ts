import '@shopify/shopify-api/adapters/web-api';
import {
  ConfigInterface as ApiConfig,
  LATEST_API_VERSION,
  ShopifyError,
  ShopifyRestResources,
  shopifyApi,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {type AppConfig, type AppConfigArg} from './config-types';
import {
  AppDistribution,
  type BasicParams,
  type ShopifyApp,
  type ShopifyAppBase,
  type AdminApp,
  type SingleMerchantApp,
  type AppStoreApp,
} from './types';
import {SHOPIFY_REMIX_LIBRARY_VERSION} from './version';
import {registerWebhooksFactory} from './authenticate/webhooks';
import {authStrategyFactory} from './authenticate/admin/authenticate';
import {authenticateWebhookFactory} from './authenticate/webhooks/authenticate';
import {overrideLogger} from './override-logger';
import {addDocumentResponseHeadersFactory} from './authenticate/helpers';
import {loginFactory} from './authenticate/login/login';
import {unauthenticatedAdminContextFactory} from './unauthenticated/admin';
import {authenticatePublicFactory} from './authenticate/public';
import {unauthenticatedStorefrontContextFactory} from './unauthenticated/storefront';
import {AuthCodeFlowStrategy} from './authenticate/admin/strategies/auth-code-flow';
import {TokenExchangeStrategy} from './authenticate/admin/strategies/token-exchange';
import {MerchantCustomAuth} from './authenticate/admin/strategies/merchant-custom-app';
import {IdempotentPromiseHandler} from './authenticate/helpers/idempotent-promise-handler';
import {authenticateFlowFactory} from './authenticate/flow/authenticate';
import {authenticateFulfillmentServiceFactory} from './authenticate/fulfillment-service/authenticate';
import {FutureFlagOptions, logDisabledFutureFlags} from './future/flags';

/**
 * Creates an object your app will use to interact with Shopify.
 *
 * @param appConfig Configuration options for your Shopify app, such as the scopes your app needs.
 * @returns `ShopifyApp` An object constructed using your appConfig.  It has methods for interacting with Shopify.
 *
 * @example
 * <caption>The minimum viable configuration</caption>
 * ```ts
 * // /shopify.server.ts
 * import { shopifyApp } from "@shopify/shopify-app-remix/server";
 *
 * const shopify = shopifyApp({
 *   apiKey: process.env.SHOPIFY_API_KEY!,
 *   apiSecretKey: process.env.SHOPIFY_API_SECRET!,
 *   scopes: process.env.SCOPES?.split(",")!,
 *   appUrl: process.env.SHOPIFY_APP_URL!,
 * });
 * export default shopify;
 * ```
 */
export function shopifyApp<
  Config extends AppConfigArg<Resources, Storage, Future>,
  Resources extends ShopifyRestResources,
  Storage extends SessionStorage,
  Future extends FutureFlagOptions = Config['future'],
>(appConfig: Readonly<Config>): ShopifyApp<Config> {
  const api = deriveApi(appConfig);
  const config = deriveConfig<Storage>(appConfig, api.config);
  const logger = overrideLogger(api.logger);

  if (appConfig.webhooks) {
    api.webhooks.addHandlers(appConfig.webhooks);
  }

  const params: BasicParams = {api, config, logger};

  let strategy;
  if (config.distribution === AppDistribution.ShopifyAdmin) {
    strategy = new MerchantCustomAuth(params);
  } else if (
    config.future.unstable_newEmbeddedAuthStrategy &&
    config.isEmbeddedApp
  ) {
    strategy = new TokenExchangeStrategy(params);
  } else {
    strategy = new AuthCodeFlowStrategy(params);
  }

  const authStrategy = authStrategyFactory<Config, Resources>({
    ...params,
    strategy,
  });

  const shopify:
    | AdminApp<Config>
    | AppStoreApp<Config>
    | SingleMerchantApp<Config> = {
    sessionStorage: config.sessionStorage,
    addDocumentResponseHeaders: addDocumentResponseHeadersFactory(params),
    registerWebhooks: registerWebhooksFactory(params),
    authenticate: {
      admin: authStrategy,
      flow: authenticateFlowFactory<Config, Resources>(params),
      public: authenticatePublicFactory<Config, Resources>(params),
      fulfillmentService: authenticateFulfillmentServiceFactory<
        Config,
        Resources
      >(params),
      webhook: authenticateWebhookFactory<Config, Resources, string>(params),
    },
    unauthenticated: {
      admin: unauthenticatedAdminContextFactory<Config, Resources>(params),
      storefront: unauthenticatedStorefrontContextFactory(params),
    },
  };

  if (
    isAppStoreApp(shopify, appConfig) ||
    isSingleMerchantApp(shopify, appConfig)
  ) {
    shopify.login = loginFactory(params);
  }

  logDisabledFutureFlags(config, logger);

  return shopify as ShopifyApp<Config>;
}

function isAppStoreApp<Config extends AppConfigArg>(
  _shopify: ShopifyAppBase<Config>,
  config: Config,
): _shopify is AppStoreApp<Config> {
  return config.distribution === AppDistribution.AppStore;
}

function isSingleMerchantApp<Config extends AppConfigArg>(
  _shopify: ShopifyAppBase<Config>,
  config: Config,
): _shopify is SingleMerchantApp<Config> {
  return config.distribution === AppDistribution.SingleMerchant;
}

// This function is only exported so we can unit test it without having to mock the underlying module.
// It's not available to consumers of the library because it is not exported in the index module, and never should be.
export function deriveApi(appConfig: AppConfigArg): BasicParams['api'] {
  let appUrl: URL;
  try {
    appUrl = new URL(appConfig.appUrl);
  } catch (error) {
    const message =
      appConfig.appUrl === ''
        ? `Detected an empty appUrl configuration, please make sure to set the necessary environment variables.\n` +
          `If you're deploying your app, you can find more information at https://shopify.dev/docs/apps/launch/deployment/deploy-web-app/deploy-to-hosting-service#step-4-set-up-environment-variables`
        : `Invalid appUrl configuration '${appConfig.appUrl}', please provide a valid URL.`;
    throw new ShopifyError(message);
  }

  /* eslint-disable no-process-env */
  if (appUrl.hostname === 'localhost' && !appUrl.port && process.env.PORT) {
    appUrl.port = process.env.PORT;
  }
  /* eslint-enable no-process-env */
  appConfig.appUrl = appUrl.origin;

  let userAgentPrefix = `Shopify Remix Library v${SHOPIFY_REMIX_LIBRARY_VERSION}`;
  if (appConfig.userAgentPrefix) {
    userAgentPrefix = `${appConfig.userAgentPrefix} | ${userAgentPrefix}`;
  }

  return shopifyApi({
    ...appConfig,
    hostName: appUrl.host,
    hostScheme: appUrl.protocol.replace(':', '') as 'http' | 'https',
    userAgentPrefix,
    isEmbeddedApp: appConfig.isEmbeddedApp ?? true,
    apiVersion: appConfig.apiVersion ?? LATEST_API_VERSION,
    isCustomStoreApp: appConfig.distribution === AppDistribution.ShopifyAdmin,
    billing: appConfig.billing as ApiConfig['billing'],
    future: {
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
      matchGraphQLSpec: appConfig.future?.matchGraphQLSpec ?? false,
    },
    _logDisabledFutureFlags: false,
  });
}

function deriveConfig<Storage extends SessionStorage>(
  appConfig: AppConfigArg,
  apiConfig: ApiConfig,
): AppConfig<Storage> {
  if (
    !appConfig.sessionStorage &&
    appConfig.distribution !== AppDistribution.ShopifyAdmin
  ) {
    throw new ShopifyError(
      'Please provide a valid session storage. Refer to https://github.com/Shopify/shopify-app-js/blob/main/README.md#session-storage-options for options.',
    );
  }

  const authPathPrefix = appConfig.authPathPrefix || '/auth';
  appConfig.distribution = appConfig.distribution ?? AppDistribution.AppStore;

  return {
    ...appConfig,
    ...apiConfig,
    billing: appConfig.billing as ApiConfig['billing'],
    scopes: apiConfig.scopes,
    idempotentPromiseHandler: new IdempotentPromiseHandler(),
    canUseLoginForm: appConfig.distribution !== AppDistribution.ShopifyAdmin,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: appConfig.sessionStorage as Storage,
    future: appConfig.future ?? {},
    auth: {
      path: authPathPrefix,
      callbackPath: `${authPathPrefix}/callback`,
      patchSessionTokenPath: `${authPathPrefix}/session-token`,
      exitIframePath: `${authPathPrefix}/exit-iframe`,
      loginPath: `${authPathPrefix}/login`,
    },
    distribution: appConfig.distribution,
  };
}
