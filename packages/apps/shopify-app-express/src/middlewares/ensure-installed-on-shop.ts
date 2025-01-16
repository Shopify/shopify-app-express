import {Request, Response, NextFunction} from 'express';
import {Session, Shopify} from '@shopify/shopify-api';

import {redirectToAuth} from '../redirect-to-auth';
import {AppConfigInterface} from '../config-types';
import {ApiAndConfigParams} from '../types';
import {AppInstallations} from '../app-installations';

import {EnsureInstalledMiddleware} from './types';
import {addCSPHeader} from './csp-headers';
import {validateAuthenticatedSession} from './validate-authenticated-session';
import {hasValidAccessToken} from './has-valid-access-token';

interface EnsureInstalledParams extends ApiAndConfigParams {}

export function ensureInstalled({
  api,
  config,
}: EnsureInstalledParams): EnsureInstalledMiddleware {
  return function ensureInstalledOnShop() {
    return async (req: Request, res: Response, next: NextFunction) => {
      config.logger.debug('Running ensureInstalledOnShop');

      if (!api.config.isEmbeddedApp) {
        config.logger.warning(
          'ensureInstalledOnShop() should only be used in embedded apps; calling validateAuthenticatedSession() instead',
        );

        return validateAuthenticatedSession({api, config})()(req, res, next);
      }

      const shop = getRequestShop(api, config, req, res);
      if (!shop) {
        return undefined;
      }

      config.logger.debug('Checking if shop has installed the app', {shop});

      const sessionId = api.session.getOfflineId(shop);
      const session = await config.sessionStorage.loadSession(sessionId);

      const exitIframeRE = new RegExp(`^${config.exitIframePath}`, 'i');
      if (!session && !req.originalUrl.match(exitIframeRE)) {
        config.logger.debug(
          'App installation was not found for shop, redirecting to auth',
          {shop},
        );

        return redirectToAuth({req, res, api, config});
      }

      if (api.config.isEmbeddedApp && req.query.embedded !== '1') {
        if (await sessionHasValidAccessToken(api, config, session)) {
          await embedAppIntoShopify(api, config, req, res, shop);
          return undefined;
        } else {
          config.logger.info(
            'Found a session, but it is not valid. Redirecting to auth',
            {shop},
          );

          return redirectToAuth({req, res, api, config});
        }
      }

      addCSPHeader(api, req, res);

      config.logger.debug('App is installed and ready to load', {shop});

      return next();
    };
  };
}

export function deleteAppInstallationHandler(
  appInstallations: AppInstallations,
  config: AppConfigInterface,
) {
  return async function (
    _topic: string,
    shop: string,
    _body: any,
    _webhookId: string,
  ) {
    config.logger.debug('Deleting shop sessions', {shop});

    await appInstallations.delete(shop);
  };
}

function getRequestShop(
  api: Shopify,
  config: AppConfigInterface,
  req: Request,
  res: Response,
): string | undefined {
  if (typeof req.query.shop !== 'string') {
    config.logger.error(
      'ensureInstalledOnShop did not receive a shop query argument',
      {shop: req.query.shop},
    );

    res.status(400);
    res.send('No shop provided');
    return undefined;
  }

  const shop = api.utils.sanitizeShop(req.query.shop);

  if (!shop) {
    config.logger.error(
      'ensureInstalledOnShop did not receive a valid shop query argument',
      {shop: req.query.shop},
    );

    res.status(422);
    res.send('Invalid shop provided');
    return undefined;
  }

  return shop;
}

async function sessionHasValidAccessToken(
  api: Shopify,
  config: AppConfigInterface,
  session: Session | undefined,
): Promise<boolean> {
  if (!session) {
    return false;
  }

  try {
    return (
      session.isActive(api.config.scopes) &&
      (await hasValidAccessToken(api, session))
    );
  } catch (error) {
    config.logger.error(`Could not check if session was valid: ${error}`, {
      shop: session.shop,
    });
    return false;
  }
}

async function embedAppIntoShopify(
  api: Shopify,
  config: AppConfigInterface,
  req: Request,
  res: Response,
  shop: string,
): Promise<void> {
  let embeddedUrl: string;
  try {
    embeddedUrl = await api.auth.getEmbeddedAppUrl({
      rawRequest: req,
      rawResponse: res,
    });
  } catch (error) {
    config.logger.error(
      `ensureInstalledOnShop did not receive a host query argument`,
      {shop},
    );

    res.status(400);
    res.send('No host provided');
    return;
  }

  config.logger.debug(
    `Request is not embedded but app is. Redirecting to ${embeddedUrl} to embed the app`,
    {shop},
  );

  res.redirect(embeddedUrl + req.path);
}
