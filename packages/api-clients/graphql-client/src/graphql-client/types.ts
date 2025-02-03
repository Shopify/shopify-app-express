interface CustomRequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: string;
  signal?: AbortSignal;
}

export type CustomFetchApi = (
  url: string,
  init?: CustomRequestInit,
) => Promise<Response>;

type OperationVariables<TVariables = Record<string, any>> = TVariables;

export type DataChunk = Buffer | Uint8Array;

type HeadersObject = Record<string, string | string[]>;

export type {HeadersObject as Headers};

export interface ResponseErrors {
  networkStatusCode?: number;
  message?: string;
  graphQLErrors?: {
    message: string;
    extensions?: GQLExtensions;
  }[];
  response?: Response;
}

export interface GQLExtensions {
  cost?: {
    requestedQueryCost: number;
    actualQueryCost: number;
    throttleStatus: {
      maximumAvailable: number;
      currentlyAvailable: number;
      restoreRate: number;
    };
    code?: string;
    maxCost?: number;
    documentation?: string;
    [key: string]: unknown;
  };
}

export interface FetchResponseBody<TData = any> {
  data?: TData;
  extensions?: GQLExtensions;
  headers?: Headers;
}

export interface ClientResponse<TData = any> extends FetchResponseBody<TData> {
  errors?: ResponseErrors;
}

export type SuccessClientResponse<TData = any> = Omit<
  ClientResponse<TData>,
  'errors'
>;
export type ErrorClientResponse = Omit<ClientResponse, 'data' | 'extensions'>;

export interface ClientStreamResponse<TData = any>
  extends ClientResponse<TData> {
  hasNext: boolean;
}

export interface ClientStreamIterator<TData = any> {
  [Symbol.asyncIterator](): AsyncIterator<ClientStreamResponse<TData>>;
}

export interface LogContent {
  type: string;
  content: any;
}

export interface HTTPResponseLog extends LogContent {
  type: 'HTTP-Response';
  content: {
    requestParams: Parameters<CustomFetchApi>;
    response: Response;
  };
}

export interface HTTPRetryLog extends LogContent {
  type: 'HTTP-Retry';
  content: {
    requestParams: Parameters<CustomFetchApi>;
    lastResponse?: Response;
    retryAttempt: number;
    maxRetries: number;
  };
}

export type LogContentTypes = HTTPResponseLog | HTTPRetryLog;

export type Logger<TLogContentTypes = LogContentTypes> = (
  logContent: TLogContentTypes,
) => void;

export interface ClientOptions {
  headers: HeadersObject;
  url: string;
  customFetchApi?: CustomFetchApi;
  retries?: number;
  logger?: Logger;
}

export interface ClientConfig {
  readonly headers: ClientOptions['headers'];
  readonly url: ClientOptions['url'];
  readonly retries: Required<ClientOptions>['retries'];
}

export interface RequestOptions {
  readonly variables?: OperationVariables;
  readonly url?: string;
  readonly headers?: HeadersObject;
  readonly retries?: number;
  readonly signal?: AbortSignal;
}

export type RequestParams = [operation: string, options?: RequestOptions];

export interface GraphQLClient {
  readonly config: ClientConfig;
  fetch: (...props: RequestParams) => Promise<Response>;
  request: <TData = any>(
    ...props: RequestParams
  ) => Promise<ClientResponse<TData>>;
  requestStream: <TData = any>(
    ...props: RequestParams
  ) => Promise<ClientStreamIterator<TData>>;
}
