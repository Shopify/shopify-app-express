import type {
  AllOperations,
  ReturnData,
  FetchResponseBody,
  ApiClientRequestOptions,
  ResponseWithType,
} from '@shopify/admin-api-client';
import {ApiVersion} from '@shopify/shopify-api';

export interface GraphQLQueryOptions<
  Operation extends keyof Operations,
  Operations extends AllOperations,
> {
  /**
   * The variables to pass to the operation.
   */
  variables?: ApiClientRequestOptions<Operation, Operations>['variables'];
  /**
   * The version of the API to use for the request.
   */
  apiVersion?: ApiVersion;
  /**
   * Additional headers to include in the request.
   */
  headers?: Record<string, any>;
  /**
   * The total number of times to try the request if it fails.
   */
  tries?: number;

  /**
   * An optional AbortSignal to cancel the request.
   */
  signal?: AbortSignal;
}

export type GraphQLResponse<
  Operation extends keyof Operations,
  Operations extends AllOperations,
  TMatchGraphQLSpec extends boolean,
> = ResponseWithType<
  FetchResponseBody<ReturnData<Operation, Operations>, TMatchGraphQLSpec>
>;

export type GraphQLClient<
  Operations extends AllOperations,
  TMatchGraphQLSpec extends boolean,
> = <Operation extends keyof Operations>(
  query: Operation,
  options?: GraphQLQueryOptions<Operation, Operations>,
) => Promise<GraphQLResponse<Operation, Operations, TMatchGraphQLSpec>>;
