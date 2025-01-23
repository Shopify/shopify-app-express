import {ShopifyError} from './error';
import {ConfigInterface, ConfigParams} from './base-types';
import {LATEST_API_VERSION, LogSeverity} from './types';
import {AuthScopes} from './auth/scopes';

export function validateConfig<Params extends ConfigParams>(
  params: Params,
): ConfigInterface<Params> {
  const config = {
    apiKey: '',
    apiSecretKey: '',
    hostName: '',
    hostScheme: 'https',
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
    isCustomStoreApp: false,
    logger: {
      log: defaultLogFunction,
      level: LogSeverity.Info,
      httpRequests: false,
      timestamps: false,
    },
    future: {},
    _logDisabledFutureFlags: true,
  } as ConfigInterface<Params>;

  // Make sure that the essential params actually have content in them
  const mandatory: (keyof Params)[] = ['apiSecretKey', 'hostName'];
  if (!('isCustomStoreApp' in params) || !params.isCustomStoreApp) {
    mandatory.push('apiKey');
  }
  if ('isCustomStoreApp' in params && params.isCustomStoreApp) {
    if (
      !('adminApiAccessToken' in params) ||
      params.adminApiAccessToken?.length === 0
    ) {
      mandatory.push('adminApiAccessToken');
    }
  }

  const missing: (keyof Params)[] = [];
  mandatory.forEach((key) => {
    if (!notEmpty(params[key])) {
      missing.push(key);
    }
  });

  if (missing.length) {
    throw new ShopifyError(
      `Cannot initialize Shopify API Library. Missing values for: ${missing.join(
        ', ',
      )}`,
    );
  }

  // Alias the v10_lineItemBilling flag to lineItemBilling because we aren't releasing in v10
  const future = params.future?.v10_lineItemBilling
    ? {
        lineItemBilling: params.future?.v10_lineItemBilling,
        ...params.future,
      }
    : params.future;

  const {
    hostScheme,
    isCustomStoreApp,
    adminApiAccessToken,
    userAgentPrefix,
    logger,
    privateAppStorefrontAccessToken,
    customShopDomains,
    billing,
    ...mandatoryParams
  } = params;

  let scopes;
  if (params.scopes === undefined) {
    scopes = undefined;
  } else if (params.scopes instanceof AuthScopes) {
    scopes = params.scopes;
  } else {
    scopes = new AuthScopes(params.scopes);
  }

  Object.assign(config, mandatoryParams, {
    hostName: params.hostName.replace(/\/$/, ''),
    scopes,
    hostScheme: hostScheme ?? config.hostScheme,
    isCustomStoreApp: isCustomStoreApp ?? config.isCustomStoreApp,
    adminApiAccessToken: adminApiAccessToken ?? config.adminApiAccessToken,
    userAgentPrefix: userAgentPrefix ?? config.userAgentPrefix,
    logger: {...config.logger, ...(logger || {})},
    privateAppStorefrontAccessToken:
      privateAppStorefrontAccessToken ?? config.privateAppStorefrontAccessToken,
    customShopDomains: customShopDomains ?? config.customShopDomains,
    billing: billing ?? config.billing,
    future: future ?? config.future,
  });

  return config;
}

function notEmpty<T>(value: T): value is NonNullable<T> {
  if (value == null) {
    return false;
  }
  return typeof value === 'string' || Array.isArray(value)
    ? value.length > 0
    : true;
}

function defaultLogFunction(severity: LogSeverity, message: string): void {
  switch (severity) {
    case LogSeverity.Debug:
      console.debug(message);
      break;
    case LogSeverity.Info:
      console.log(message);
      break;
    case LogSeverity.Warning:
      console.warn(message);
      break;
    case LogSeverity.Error:
      console.error(message);
      break;
  }
}
