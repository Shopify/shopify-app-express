import type {
  ConfigParams,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {AppConfig} from '../config-types';

// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that
// it doesn't cause regressions.
export interface FutureFlags {
  /**
   * When enabled, embedded apps will fetch access tokens via [token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange).
   * This assumes the app has scopes declared for [Shopify managing installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation).
   *
   * Learn more about this [new embedded app auth strategy](https://shopify.dev/docs/api/shopify-app-remix#embedded-auth-strategy).
   *
   * @default false
   */
  unstable_newEmbeddedAuthStrategy?: boolean;

  /**
   * When enabled, methods for interacting with the admin REST API will not be returned.
   *
   * This affects:
   *
   * * `authenticate.admin(request)`
   * * `authenticate.webhook(request)`
   * * `authenticate.flow(request)`
   * * `authenticate.appProxy(request)`
   * * `authenticate.fulfillmentService(request)`
   * * `unauthenticated.admin(shop)`
   *
   * In a future release we will remove REST from the package completely.
   *
   * Please see: [https://www.shopify.com/ca/partners/blog/all-in-on-graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql)
   *
   * @default false
   */
  removeRest?: boolean;

  /**
   * When enabled, the GraphQL client will match the spec and return `errors` on the response. When disabled, the client wiill throw errors instead.
   * @default false
   */
  matchGraphQLSpec?: boolean;
}

// When adding new flags, use this format:
// apiFutureFlag: Future extends FutureFlags ? Future['remixFutureFlag'] : false;
export interface ApiFutureFlags<_Future extends FutureFlagOptions> {
  // We're currently hardcoding this flag to true in our settings, so we should propagate it here
  lineItemBilling: true;
  unstable_managedPricingSupport: true;
  /**
   * When enabled, the GraphQL client will match the spec and return `errors` on the response. When disabled, the client wiill throw errors instead.
   * @default false
   */
  matchGraphQLSpec?: boolean;
}

export type ApiConfigWithFutureFlags<Future extends FutureFlagOptions> =
  ConfigParams<ShopifyRestResources, ApiFutureFlags<Future>>;

export type FutureFlagOptions = FutureFlags | undefined;

export type FeatureEnabled<
  Future extends FutureFlagOptions,
  Flag extends keyof FutureFlags,
> = Future extends FutureFlags
  ? Future[Flag] extends true
    ? true
    : false
  : false;

export function logDisabledFutureFlags(
  config: AppConfig,
  logger: Shopify['logger'],
) {
  const logFlag = (flag: string, message: string) =>
    logger.info(`Future flag ${flag} is disabled.\n\n  ${message}\n`);

  if (!config.future.unstable_newEmbeddedAuthStrategy) {
    logFlag(
      'unstable_newEmbeddedAuthStrategy',
      'Enable this to use OAuth token exchange instead of auth code to generate API access tokens.' +
        '\n  Your app must be using Shopify managed install: https://shopify.dev/docs/apps/auth/installation',
    );
  }
}
