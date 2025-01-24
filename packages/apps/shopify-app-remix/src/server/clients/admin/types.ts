import {AdminOperations} from '@shopify/admin-api-client';
import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AppConfigArg} from '../../config-types';
import type {FeatureEnabled} from '../../future/flags';
import {BasicParams} from '../../types';
import {GraphQLClient} from '../types';

import type {RestClientWithResources} from './rest';

export interface AdminClientOptions {
  params: BasicParams;
  session: Session;
  handleClientError?: HandleAdminClientError;
}

export type HandleAdminClientError = (arg: {
  error: any;
  params: BasicParams;
  session: Session;
}) => Promise<void>;

export type AdminApiContext<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> =
  FeatureEnabled<ConfigArg['future'], 'removeRest'> extends true
    ? AdminApiContextWithoutRest<
        FeatureEnabled<ConfigArg['future'], 'matchGraphQLSpec'>
      >
    : AdminApiContextWithRest<
        Resources,
        FeatureEnabled<ConfigArg['future'], 'matchGraphQLSpec'>
      >;

export interface AdminApiContextWithoutRest<TMatchGraphQLSpec extends boolean> {
  /**
   * Methods for interacting with the Shopify Admin GraphQL API
   *
   * {@link https://shopify.dev/docs/api/admin-graphql}
   * {@link https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/reference/clients/Graphql.md}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   const response = await admin.graphql(
   *     `#graphql
   *     mutation populateProduct($input: ProductInput!) {
   *       productCreate(input: $input) {
   *         product {
   *           id
   *         }
   *       }
   *     }`,
   *     {
   *       variables: {
   *         input: { title: "Product Name" },
   *       },
   *     },
   *   );
   *
   *   const productData = await response.json();
   *   return json({
   *     productId: productData.data?.productCreate?.product?.id,
   *   });
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Handling GraphQL errors.</caption>
   * <description>Catch `GraphqlQueryError` errors to see error messages from the API.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   try {
   *     const response = await admin.graphql(
   *       `#graphql
   *       query incorrectQuery {
   *         products(first: 10) {
   *           nodes {
   *             not_a_field
   *           }
   *         }
   *       }`,
   *     );
   *
   *     return json({ data: await response.json() });
   *   } catch (error) {
   *     if (error instanceof GraphqlQueryError) {
   *       // error.body.errors:
   *       // { graphQLErrors: [
   *       //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
   *       // ] }
   *       return json({ errors: error.body?.errors }, { status: 500 });
   *     }
   *     return json({ message: "An error occurred" }, { status: 500 });
   *   }
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  graphql: GraphQLClient<AdminOperations, TMatchGraphQLSpec>;
}

export interface AdminApiContextWithRest<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  TMatchGraphQLSpec extends boolean = false,
> extends AdminApiContextWithoutRest<TMatchGraphQLSpec> {
  /**
   * Methods for interacting with the Shopify Admin REST API
   *
   * @deprecated In a future major release REST will be removed from this package. Please see [all-in on graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql).
   *
   * There are methods for interacting with individual REST resources. You can also make `GET`, `POST`, `PUT` and `DELETE` requests should the REST resources not meet your needs.
   *
   * {@link https://shopify.dev/docs/api/admin-rest}
   *
   * @example
   * <caption>Using REST resources.</caption>
   * <description>Getting the number of orders in a store using REST resources. Visit the [Admin REST API references](/docs/api/admin-rest) for examples on using each resource. </description>
   *
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const {
   *     admin,
   *     session,
   *   } = await authenticate.admin(request);
   *
   *   return json(
   *     admin.rest.resources.Order.count({ session }),
   *   );
   * };
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Performing a GET request to the REST API.</caption>
   * <description>Use `admin.rest.get` to make custom requests to make a request to to the `customer/count` endpoint</description>
   *
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const {
   *     admin,
   *     session,
   *   } = await authenticate.admin(request);
   *
   *   const response = await admin.rest.get({
   *     path: "/customers/count.json",
   *   });
   *   const customers = await response.json();
   *
   *   return json({ customers });
   * };
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Performing a POST request to the REST API.</caption>
   * <description>Use `admin.rest.post` to make custom requests to make a request to to the `customers.json` endpoint to send a welcome email</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const {
   *     admin,
   *     session,
   *   } = await authenticate.admin(request);
   *
   *   const response = admin.rest.post({
   *     path: "customers/7392136888625/send_invite.json",
   *     body: {
   *       customer_invite: {
   *         to: "new_test_email@shopify.com",
   *         from: "j.limited@example.com",
   *         bcc: ["j.limited@example.com"],
   *         subject: "Welcome to my new shop",
   *         custom_message: "My awesome new store",
   *       },
   *     },
   *   });
   *
   *   const customerInvite = await response.json();
   *   return json({ customerInvite });
   * };
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  rest: RestClientWithResources<Resources>;
}
