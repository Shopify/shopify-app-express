import {StorefrontOperations} from '@shopify/storefront-api-client';

import {GraphQLClient} from '../types';

export interface StorefrontContext<TMatchGraphQLSpec extends boolean = false> {
  /**
   * Method for interacting with the Shopify Storefront GraphQL API
   *
   * If you're getting incorrect type hints in the Shopify template, follow [these instructions](https://github.com/Shopify/shopify-app-template-remix/tree/main#incorrect-graphql-hints).
   *
   * {@link https://shopify.dev/docs/api/storefront}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `storefront.graphql` to make query / mutation requests.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { storefront } = await authenticate.public.appProxy(request);
   *
   *   const response = await storefront.graphql(`{blogs(first: 10) { edges { node { id } } } }`);
   *
   *   return json(await response.json());
   * }
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
   *   const { storefront } = await authenticate.public.appProxy(request);
   *
   *   try {
   *     const response = await storefront.graphql(
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
   *       // { errors: { graphQLErrors: [
   *       //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
   *       // ] } }
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
  graphql: GraphQLClient<StorefrontOperations, TMatchGraphQLSpec>;
}
