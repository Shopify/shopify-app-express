import {JwtPayload, Session, ShopifyRestResources} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../helpers/ensure-cors-headers';
import {AdminContext} from '../admin/types';
import {BillingContext} from '../admin/billing/types';
import {AppConfigArg} from '../../config-types';

export interface AuthenticatePOSOptions {
  corsHeaders?: string[];
}

/**
 * Authenticated Context for a POS UI extension request
 */
export interface POSContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources,
> {
  /**
   * The decoded and validated session token for the request
   *
   * Refer to the OAuth docs for the [session token payload](https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload).
   *
   * @example
   * <caption>Using the decoded session token.</caption>
   * <description>Get store-specific data using the `sessionToken` object.</description>
   * ```ts
   * // app/routes/public/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken } = await authenticate.public.pos(
   *     request
   *   );
   *   return json(await getMyAppData({shop: sessionToken.dest}));
   * };
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that ensures the CORS headers are set correctly for the response.
   *
   * @example
   * <caption>Setting CORS headers for a public request.</caption>
   * <description>Use the `cors` helper to ensure your app can respond to POS UI extension requests.</description>
   * ```ts
   * // app/routes/public/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.pos(
   *     request,
   *     { corsHeaders: ["X-My-Custom-Header"] }
   *   );
   *   const data = await getMyAppData({shop: sessionToken.dest});
   *   return cors(json(data));
   * };
   * ```
   */
  cors: EnsureCORSFunction;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.
   */
  admin: AdminContext<Config, Resources>;
  session: Session;
  billing: BillingContext<Config>['check'];
}

export type AuthenticatePOS<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<POSContext<Config, Resources>>;
