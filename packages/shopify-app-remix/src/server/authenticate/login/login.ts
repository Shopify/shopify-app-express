import {redirect} from '@remix-run/server-runtime';

import {BasicParams, LoginError, LoginErrorType} from '../../types';

export function loginFactory(params: BasicParams) {
  const {api, config, logger} = params;

  return async function login(request: Request): Promise<LoginError | never> {
    const url = new URL(request.url);
    const shopParam = url.searchParams.get('shop');
    const contentLength = parseInt(
      request.headers.get('Content-Length') ?? '0',
      10,
    );

    // A HEAD request will be passed as a GET request, to avoid calling `request.formData()` on an empty body in a HEAD request
    // we check if the `Content-Length` header is truthy so it's safe to call `request.formData()`
    if (request.method === 'GET' && !shopParam && !contentLength) {
      return {};
    }

    const shop: string | null =
      shopParam || ((await request.formData()).get('shop') as string);

    if (!shop) {
      logger.debug('Missing shop parameter', {shop});
      return {shop: LoginErrorType.MissingShop};
    }

    const shopWithoutProtocol = shop
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
    const shopWithDomain =
      shop?.indexOf('.') === -1
        ? `${shopWithoutProtocol}.myshopify.com`
        : shopWithoutProtocol;
    const sanitizedShop = api.utils.sanitizeShop(shopWithDomain);

    if (!sanitizedShop) {
      logger.debug('Invalid shop parameter', {shop});
      return {shop: LoginErrorType.InvalidShop};
    }

    const authPath = `${config.appUrl}${config.auth.path}?shop=${sanitizedShop}`;

    const adminPath = api.utils.legacyUrlToShopAdminUrl(sanitizedShop);
    const installPath = `https://${adminPath}/oauth/install?client_id=${config.apiKey}`;

    const shouldInstall =
      config.isEmbeddedApp && config.future.unstable_newEmbeddedAuthStrategy;
    const redirectUrl = shouldInstall ? installPath : authPath;

    logger.info(`Redirecting login request to ${redirectUrl}`, {
      shop: sanitizedShop,
    });

    throw redirect(redirectUrl);
  };
}
