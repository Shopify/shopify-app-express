import {loadRestResources} from '../rest/load-rest-resources';
import {ShopifyRestResources} from '../rest/types';
import {abstractRuntimeString} from '../runtime/platform';
import {FutureFlagOptions, logDisabledFutureFlags} from '../future/flags';

import {ConfigParams, ConfigInterface} from './base-types';
import {validateConfig} from './config';
import {clientClasses, ShopifyClients} from './clients';
import {shopifyAuth, ShopifyAuth} from './auth';
import {shopifySession, ShopifySession} from './session';
import {shopifyUtils, ShopifyUtils} from './utils';
import {shopifyWebhooks, ShopifyWebhooks} from './webhooks';
import {shopifyBilling, ShopifyBilling} from './billing';
import {logger, ShopifyLogger} from './logger';
import {SHOPIFY_API_LIBRARY_VERSION} from './version';
import {restClientClass} from './clients/admin/rest/client';
import {ShopifyFlow, shopifyFlow} from './flow';
import {FulfillmentService, fulfillmentService} from './fulfillment-service';

export * from './error';
export * from './session/classes';

export * from '../rest/types';
export * from './types';
export * from './base-types';
export * from './auth/types';
export * from './billing/types';
export * from './clients/types';
export * from './session/types';
export * from './webhooks/types';
export * from './utils/types';

export interface Shopify<
  Params extends ConfigParams = ConfigParams,
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  config: ConfigInterface<Params>;
  clients: ShopifyClients;
  auth: ShopifyAuth;
  session: ShopifySession<ConfigInterface<Params>>;
  utils: ShopifyUtils;

  /**
   * Functions for working with webhooks.
   *
   * Most of these functions are used for interacting with shop-specific webhooks.
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks instead:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, the only function you will need is `shopify.webhooks.validate`.
   */
  webhooks: ShopifyWebhooks;
  billing: ShopifyBilling<Future>;
  logger: ShopifyLogger;
  rest: Resources;
  flow: ShopifyFlow;
  fulfillmentService: FulfillmentService;
}

export function shopifyApi<
  Params extends ConfigParams<Resources, Future>,
  Resources extends ShopifyRestResources,
  Future extends FutureFlagOptions = Params['future'],
>({
  future,
  restResources,
  ...config
}: {future?: Future; restResources?: Resources} & Params): Shopify<
  Params,
  Resources,
  Future
> {
  const libConfig = {...config, future, restResources};
  const validatedConfig = validateConfig(libConfig);

  const shopify = {
    config: validatedConfig,
    clients: clientClasses(validatedConfig),
    auth: shopifyAuth(validatedConfig),
    // TODO: This doesn't seem right
    session: shopifySession(
      validatedConfig as ConfigInterface<ConfigParams<any, Future>>,
    ),
    utils: shopifyUtils(validatedConfig),
    webhooks: shopifyWebhooks(validatedConfig),
    billing: shopifyBilling(validatedConfig),
    flow: shopifyFlow(validatedConfig),
    fulfillmentService: fulfillmentService(validatedConfig),
    logger: logger(validatedConfig),
    rest: {} as Resources,
  };

  if (restResources) {
    shopify.rest = loadRestResources({
      resources: restResources,
      config: validatedConfig,
      RestClient: restClientClass({config: validatedConfig}),
    });
  }

  shopify.logger
    .info(
      `version ${SHOPIFY_API_LIBRARY_VERSION}, environment ${abstractRuntimeString()}`,
    )
    .catch((err) => console.log(err));

  logDisabledFutureFlags(validatedConfig, shopify.logger);

  return shopify as Shopify<Params, Resources, Future>;
}
