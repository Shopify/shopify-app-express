import {AdminOperations} from '@shopify/admin-api-client';

import {GraphQLClient} from '../types';

import {AdminClientOptions} from './types';

// eslint-disable-next-line no-warning-comments
// TODO: This is actually just a call through to the Shopify API client, but with a different API. We should eventually
// move this over to the library layer. While doing that, we should also allow the apiVersion to be passed into the REST
// client request calls.
export function graphqlClientFactory<
  TMatchGraphQLSpec extends boolean = false,
>({
  params,
  handleClientError,
  session,
}: AdminClientOptions): GraphQLClient<AdminOperations, TMatchGraphQLSpec> {
  return async function query(operation, options) {
    const client = new params.api.clients.Graphql({
      session,
      apiVersion: options?.apiVersion,
    });

    try {
      // We convert the incoming response to a Response object to bring this client closer to the Remix client.
      const apiResponse = await client.request(operation, {
        variables: options?.variables,
        retries: options?.tries ? options.tries - 1 : 0,
        headers: options?.headers,
        signal: options?.signal,
      });

      return new Response(JSON.stringify(apiResponse));
    } catch (error) {
      if (handleClientError) {
        throw await handleClientError({error, params, session});
      }

      throw error;
    }
  };
}
