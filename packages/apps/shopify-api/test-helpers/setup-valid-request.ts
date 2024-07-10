import {HashFormat, createSHA256HMAC} from '../runtime/crypto';

import {getShop} from './get-shop';
import {getHost} from './get-host';
import {getJwt} from './get-jwt';
import {getHmac} from './get-hmac';

export enum RequestType {
  Admin,
  Bearer,
  Extension,
  Public,
}

interface ValidBaseRequestOptions {
  type: RequestType.Admin | RequestType.Bearer;
  store: string;
  apiSecret: string;
  apiKey: string;
}

interface ValidExtensionRequestOptions {
  type: RequestType.Extension;
  store: string;
  apiSecret: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ValidPublicRequestOptions {
  type: RequestType.Public;
  store: string;
  apiSecret: string;
}

export type ValidRequestOptions =
  | ValidBaseRequestOptions
  | ValidExtensionRequestOptions
  | ValidPublicRequestOptions;

/**
 * Duplicates a Request object and decorates the duplicated object with fake authorization headers or query string parameters.
 *
 * @param {ValidRequestOptions} options Provides the type of authorization method to fake for the provided Request, and the inputs required to fake the authorization.
 * @param {Request} request The Request object to be decorated with fake authorization headers or query string parameters.
 * @returns {Request} A duplicate of the provided Request object with faked authorization headers or query string parameters.
 */
export async function setUpValidRequest(
  options: ValidRequestOptions,
  request: Request,
) {
  let authenticatedRequest: Request;
  switch (options.type) {
    case RequestType.Admin:
      authenticatedRequest = adminRequest(
        request,
        options.store,
        options.apiKey,
        options.apiSecret,
      );
      break;
    case RequestType.Bearer:
      authenticatedRequest = bearerRequest(
        request,
        options.store,
        options.apiKey,
        options.apiSecret,
      );
      break;
    case RequestType.Extension:
      authenticatedRequest = extensionRequest(
        request,
        options.store,
        options.apiSecret,
        options.body,
        options.headers,
      );
      break;
    case RequestType.Public:
      authenticatedRequest = await publicRequest(
        request,
        options.store,
        options.apiSecret,
      );
      break;
  }

  return authenticatedRequest;
}

function adminRequest(
  request: Request,
  store: string,
  apiKey: string,
  apiSecret: string,
) {
  const {token} = getJwt(store, apiKey, apiSecret);

  const url = new URL(request.url);
  url.searchParams.set('embedded', '1');
  url.searchParams.set('shop', getShop(store));
  url.searchParams.set('host', getHost(store));
  url.searchParams.set('id_token', token);
  return new Request(url.href, request);
}

function bearerRequest(
  request: Request,
  store: string,
  apiKey: string,
  apiSecret: string,
) {
  const {token} = getJwt(store, apiKey, apiSecret);

  return new Request(request, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

function extensionRequest(
  request: Request,
  store: string,
  apiSecret: string,
  body: any,
  headers?: Record<string, string>,
) {
  const bodyString = JSON.stringify(body);

  return new Request(request, {
    method: 'POST',
    body: bodyString,
    headers: {
      'X-Shopify-Hmac-Sha256': getHmac(bodyString, apiSecret),
      'X-Shopify-Shop-Domain': getShop(store),
      ...headers,
    },
  });
}

async function publicRequest(
  request: Request,
  store: string,
  apiSecret: string,
) {
  const url = new URL(request.url);
  url.searchParams.set('shop', getShop(store));
  url.searchParams.set('timestamp', String(Math.trunc(Date.now() / 1000) - 1));

  const params = Object.fromEntries(url.searchParams.entries());
  const string = Object.entries(params)
    .sort(([val1], [val2]) => val1.localeCompare(val2))
    .reduce((acc, [key, value]) => {
      return `${acc}${key}=${value}`;
    }, '');

  url.searchParams.set(
    'signature',
    await createSHA256HMAC(apiSecret, string, HashFormat.Hex),
  );

  return new Request(url.href, request);
}
