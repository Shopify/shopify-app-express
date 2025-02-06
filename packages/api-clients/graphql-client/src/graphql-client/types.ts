interface CustomRequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: string;
  signal?: AbortSignal;
  keepalive?: boolean;
}

export type CustomFetchApi = (
  url: string,
  init?: CustomRequestInit,
) => Promise<Response>;

type OperationVariables = Record<string, any>;

export type DataChunk = Buffer | Uint8Array;

type HeadersObject = Record<string, string | string[]>;

export type {HeadersObject as Headers};

export interface ResponseErrors {
  networkStatusCode?: number;
  message?: string;
  graphQLErrors?: any[];
  response?: Response;
}

export interface SpecResponseError {
  message: string;
  locations?: {line: number; column: number}[];
  path?: string[];
  extensions?: GQLExtensions;
}

export type GQLExtensions = Record<string, any>;

export interface FetchResponseBody<
  TData = any,
  TMatchGraphQLSpec extends boolean = false,
> {
  data?: TData;
  extensions?: GQLExtensions;
  headers?: Headers;
  errors?: TMatchGraphQLSpec extends true ? SpecResponseError[] : never;
}

export interface ClientResponse<
  TData = any,
  TMatchGraphQLSpec extends boolean = false,
> extends Omit<FetchResponseBody<TData, TMatchGraphQLSpec>, 'errors'> {
  errors?: TMatchGraphQLSpec extends true
    ? SpecResponseError[]
    : ResponseErrors;
}

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
  matchGraphQLSpec?: boolean;
}

export interface ClientConfig {
  readonly headers: ClientOptions['headers'];
  readonly url: ClientOptions['url'];
  readonly retries: Required<ClientOptions>['retries'];
}

export interface RequestOptions {
  variables?: OperationVariables;
  url?: string;
  headers?: HeadersObject;
  retries?: number;
  keepalive?: boolean;
  signal?: AbortSignal;
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
