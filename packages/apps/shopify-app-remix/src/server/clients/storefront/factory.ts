import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

import type {StorefrontContext} from '.';

export function storefrontClientFactory<
  TMatchGraphQLSpec extends boolean = false,
>({
  params,
  session,
}: {
  params: BasicParams;
  session: Session;
}): StorefrontContext<TMatchGraphQLSpec> {
  const {api} = params;

  return {
    graphql: async (query, options = {}) => {
      const client = new api.clients.Storefront({
        session,
        apiVersion: options.apiVersion,
      });

      const apiResponse = await client.request(query, {
        variables: options?.variables,
        retries: options?.tries ? options.tries - 1 : 0,
        headers: options?.headers,
      });

      return new Response(JSON.stringify(apiResponse));
    },
  };
}
