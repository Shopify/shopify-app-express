import {
  TypedResponse,
  redirect as remixRedirect,
} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';
import {getSessionTokenHeader} from '../../helpers/get-session-token-header';

import {renderAppBridge} from './render-app-bridge';
import {
  redirectWithAppBridgeHeaders,
  redirectWithResponseWithAppBridgeHeaders,
} from './redirect-with-app-bridge-headers';

export type RedirectTarget = '_self' | '_parent' | '_top' | '_blank';
export type RedirectInit = number | (ResponseInit & {target?: RedirectTarget});
export type RedirectFunction = (
  url: string,
  init?: RedirectInit,
) => TypedResponse<never>;

interface ParseURLOptions {
  params: BasicParams;
  url: string;
  base: string;
  shop: string;
  init: RedirectInit;
}

interface ParsedURL {
  url: URL;
  target: RedirectTarget;
}

export function redirectFactory(
  params: BasicParams,
  request: Request,
  shop: string,
): RedirectFunction {
  const {config, logger} = params;

  return function redirect(url, init: RedirectInit) {
    const {searchParams} = new URL(request.url);
    const {url: parsedUrl, target} = parseURL({
      params,
      url,
      base: config.appUrl,
      shop,
      init,
    });

    logger.debug('Redirecting', {shop, url: parsedUrl.toString()});

    const isSameOrigin = parsedUrl.origin === config.appUrl;
    if (isSameOrigin || url.startsWith('/')) {
      searchParams.forEach((value, key) => {
        if (!parsedUrl.searchParams.has(key)) {
          parsedUrl.searchParams.set(key, value);
        }
      });
    }

    if (target === '_self') {
      if (isBounceRequest(request)) {
        throw renderAppBridge(params, request, {
          url: parsedUrl.toString(),
          target,
        });
      } else {
        return remixRedirect(parsedUrl.toString(), init);
      }
    } else if (isDataRequest(request)) {
      if (config.future.remixSingleFetch) {
        throw redirectWithAppBridgeHeaders(parsedUrl.toString());
      } else {
        throw redirectWithResponseWithAppBridgeHeaders(parsedUrl.toString());
      }
    } else if (isEmbeddedRequest(request)) {
      throw renderAppBridge(params, request, {
        url: parsedUrl.toString(),
        target,
      });
    }
    return remixRedirect(url, init);
  };
}

function isBounceRequest(request: Request) {
  return (
    Boolean(getSessionTokenHeader(request)) &&
    request.headers.has('X-Shopify-Bounce')
  );
}

function isDataRequest(request: Request) {
  const isGet = request.method === 'GET';
  const sessionTokenHeader = Boolean(getSessionTokenHeader(request));

  return (
    sessionTokenHeader &&
    !isBounceRequest(request) &&
    (!isEmbeddedRequest(request) || !isGet)
  );
}

function isEmbeddedRequest(request: Request) {
  const {searchParams} = new URL(request.url);

  return searchParams.get('embedded') === '1';
}

function parseURL({params, base, init, shop, url}: ParseURLOptions): ParsedURL {
  let target: RedirectTarget | undefined =
    typeof init !== 'number' && init?.target ? init.target : undefined;

  if (isAdminRemotePath(url)) {
    const {config} = params;

    const adminPath = getAdminRemotePath(url);
    const cleanShopName = shop.replace('.myshopify.com', '');

    if (!target) {
      target = config.isEmbeddedApp ? '_parent' : '_self';
    }

    return {
      url: new URL(
        `https://admin.shopify.com/store/${cleanShopName}${adminPath}`,
      ),
      target,
    };
  } else {
    return {
      url: new URL(url, base),
      target: target ?? '_self',
    };
  }
}

const ADMIN_REGEX = /^shopify:\/*admin\//i;

function isAdminRemotePath(url: string) {
  return ADMIN_REGEX.test(url);
}

function getAdminRemotePath(url: string | URL) {
  const parsedUrl = removeRestrictedParams(new URL(url)).href;
  return parsedUrl.replace(ADMIN_REGEX, '/');
}

const embeddedFrameParamsToRemove = [
  'hmac',
  'locale',
  'protocol',
  'session',
  'id_token',
  'shop',
  'timestamp',
  'host',
  'embedded',
  // sent when clicking rel="home" nav item
  'appLoadId',
];

function removeRestrictedParams(url: URL | string) {
  const newUrl = new URL(url);
  embeddedFrameParamsToRemove.forEach((param) =>
    newUrl.searchParams.delete(param),
  );
  return newUrl;
}
