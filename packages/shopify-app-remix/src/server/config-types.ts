import {
  ConfigParams as ApiConfigArg,
  ConfigInterface as ApiConfig,
  ShopifyRestResources,
  Session,
  ApiVersion,
  WebhookHandler,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import type {FutureFlagOptions, FutureFlags} from './future/flags';
import type {AppDistribution} from './types';
import type {AdminApiContext} from './clients';
import {IdempotentPromiseHandler} from './authenticate/helpers/idempotent-promise-handler';

export interface AppConfigArg<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
  Future extends FutureFlagOptions = FutureFlagOptions,
> extends Omit<
    ApiConfigArg<Resources>,
    | 'hostName'
    | 'hostScheme'
    | 'isEmbeddedApp'
    | 'apiVersion'
    | 'isCustomStoreApp'
    | 'future'
  > {
  /**
   * The URL your app is running on.
   *
   * The `@shopify/cli` provides this URL as `process.env.SHOPIFY_APP_URL`.  For development this is probably a tunnel URL that points to your local machine.  If this is a production app, this is your production URL.
   */
  appUrl: string;

  /**
   * An adaptor for storing sessions in your database of choice.
   *
   * Shopify provides multiple session storage adaptors and you can create your own.
   *
   * {@link https://github.com/Shopify/shopify-app-js/blob/main/README.md#session-storage-options}
   *
   * @example
   * <caption>Storing sessions with Prisma.</caption>
   * <description>Add the `@shopify/shopify-app-session-storage-prisma` package to use the Prisma session storage.</description>
   * ```ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
   *
   * import prisma from "~/db.server";
   *
   * const shopify = shopifyApp({
   *   // ... etc
   *   sessionStorage: new PrismaSessionStorage(prisma),
   * });
   * export default shopify;
   * ```
   */
  sessionStorage: Storage;

  /**
   * Whether your app use online or offline tokens.
   *
   * If your app uses online tokens, then both online and offline tokens will be saved to your database.  This ensures your app can perform background jobs.
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/access-modes}
   *
   * @defaultValue `false`
   */
  useOnlineTokens?: boolean;

  /**
   * The config for the webhook topics your app would like to subscribe to.
   *
   * {@link https://shopify.dev/docs/apps/webhooks}
   *
   * This can be in used in conjunction with the afterAuth hook to register webhook topics when a user installs your app.  Or you can use this function in other processes such as background jobs.
   *
   * @example
   * <caption>Registering for a webhook when a merchant uninstalls your app.</caption>
   * ```ts
   * // /app/shopify.server.ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   webhooks: {
   *     APP_UNINSTALLED: {
   *       deliveryMethod: DeliveryMethod.Http,
   *        callbackUrl: "/webhooks",
   *     },
   *   },
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       shopify.registerWebhooks({ session });
   *     }
   *   },
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   *
   * // /app/routes/webhooks.jsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   *
   * import { authenticate } from "../shopify.server";
   * import db from "../db.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { topic, shop } = await authenticate.webhook(request);
   *
   *   switch (topic) {
   *     case "APP_UNINSTALLED":
   *       await db.session.deleteMany({ where: { shop } });
   *       break;
   *     case "CUSTOMERS_DATA_REQUEST":
   *     case "CUSTOMERS_REDACT":
   *     case "SHOP_REDACT":
   *     default:
   *       throw new Response("Unhandled webhook topic", { status: 404 });
   *   }
   *   throw new Response();
   * };
   * ```
   */
  webhooks?: WebhookConfig;

  /**
   * Functions to call at key places during your apps lifecycle.
   *
   * These functions are called in the context of the request that triggered them.  This means you can access the session.
   *
   * @example
   * <caption>Seeding your database custom data when a merchant installs your app.</caption>
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { seedStoreData } from "~/db/seeds"
   *
   * const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       seedStoreData({session})
   *     }
   *   },
   *   // ...etc
   * });
   * ```
   */
  hooks?: HooksConfig;

  /**
   * Does your app render embedded inside the Shopify Admin or on its own.
   *
   * Unless you have very specific needs, this should be true.
   *
   * @defaultValue `true`
   */
  isEmbeddedApp?: boolean;

  /**
   * How your app is distributed. Default is `AppDistribution.AppStore`.
   *
   * {@link https://shopify.dev/docs/apps/distribution}
   */
  distribution?: AppDistribution;

  /**
   * What version of Shopify's Admin API's would you like to use.
   *
   * {@link https://shopify.dev/docs/api/}
   *
   * @defaultValue `LATEST_API_VERSION` from `@shopify/shopify-app-remix`
   *
   * @example
   * <caption>Using the latest API Version (Recommended)</caption>
   * ```ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   apiVersion: LATEST_API_VERSION,
   * });
   * ```
   */
  apiVersion?: ApiVersion;

  /**
   * A path that Shopify can reserve for auth related endpoints.
   *
   * This must match a $ route in your Remix app.  That route must export a loader function that calls `shopify.authenticate.admin(request)`.
   *
   * @default `"/auth"`
   *
   * @example
   * <caption>Using the latest API Version (Recommended)</caption>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   apiVersion: LATEST_API_VERSION,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   *
   * // /app/routes/auth/$.jsx
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   await authenticate.admin(request);
   *
   *   return null
   * }
   * ```
   */
  authPathPrefix?: string;

  /**
   * Features that will be introduced in future releases of this package.
   *
   * You can opt in to these features by setting the corresponding flags. By doing so, you can prepare for future
   * releases in advance and provide feedback on the new features.
   */
  future?: Future;
}

export interface AppConfig<Storage extends SessionStorage = SessionStorage>
  extends Omit<ApiConfig, 'future'> {
  canUseLoginForm: boolean;
  appUrl: string;
  auth: AuthConfig;
  sessionStorage: Storage;
  useOnlineTokens: boolean;
  hooks: HooksConfig;
  future: FutureFlags;
  idempotentPromiseHandler: IdempotentPromiseHandler;
}

export interface AuthConfig {
  path: string;
  callbackPath: string;
  exitIframePath: string;
  patchSessionTokenPath: string;
  loginPath: string;
}

export interface WebhookConfig {
  [key: string]: WebhookHandler | WebhookHandler[];
}

interface HooksConfig {
  /**
   * A function to call after a merchant installs your app
   *
   * @param context - An object with context about the request that triggered the hook.
   * @param context.session - The session of the merchant that installed your app. This is the output of sessionStorage.loadSession in case people want to load their own.
   * @param context.admin - An object with access to the Shopify Admin API's.
   *
   * @example
   * <caption>Registering webhooks and seeding data when a merchant installs your app.</caption>
   * ```ts
   * import { DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { seedStoreData } from "~/db/seeds"
   *
   * const shopify = shopifyApp({
   *   hooks: {
   *     afterAuth: async ({ session }) => {
   *       shopify.registerWebhooks({ session });
   *       seedStoreData({session})
   *     }
   *   },
   *   webhooks: {
   *     APP_UNINSTALLED: {
   *       deliveryMethod: DeliveryMethod.Http,
   *        callbackUrl: "/webhooks",
   *     },
   *   },
   *   // ...etc
   * });
   * ```
   */
  afterAuth?: (options: AfterAuthOptions) => void | Promise<void>;
}

export interface AfterAuthOptions<
  R extends ShopifyRestResources = ShopifyRestResources,
> {
  session: Session;
  admin: AdminApiContext<R>;
}
