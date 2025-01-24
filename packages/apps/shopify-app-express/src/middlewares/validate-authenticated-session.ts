import {Session, Shopify, InvalidJwtError} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {ApiAndConfigParams} from '../types';
import {redirectOutOfApp} from '../redirect-out-of-app';

import {ValidateAuthenticatedSessionMiddleware} from './types';
import {hasValidAccessToken} from './has-valid-access-token';

interface validateAuthenticatedSessionParams extends ApiAndConfigParams {}

/**
 * Middleware to validate the session for authenticated requests.
 *
 * This middleware ensures that the incoming request has a valid session,
 * and it checks if the session has an active and valid access token.
 *
 * If the session is invalid, it redirects the user to the authentication flow.
 *
 * Additionally, this middleware handles preflight `OPTIONS` requests for CORS
 * by bypassing the authentication checks and responding with the appropriate
 * CORS headers.
 *
 * @param {validateAuthenticatedSessionParams} params - The parameters required for the middleware, including the API and config.
 * @returns {ValidateAuthenticatedSessionMiddleware} The middleware function that validates the session.
 */
export function validateAuthenticatedSession({
  api,
  config,
}: validateAuthenticatedSessionParams): ValidateAuthenticatedSessionMiddleware {
  return function validateAuthenticatedSession() {
    return async (req: Request, res: Response, next: NextFunction) => {
      config.logger.debug('Running validateAuthenticatedSession');

      // Handle preflight OPTIONS requests for CORS
      // Bypasses authentication and responds with the necessary CORS headers.
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET,POST,PUT,DELETE,OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );
        // Respond with 200 OK for OPTIONS requests
        return res.sendStatus(200);
      }

      let sessionId: string | undefined;
      try {
        sessionId = await api.session.getCurrentId({
          isOnline: config.useOnlineTokens,
          rawRequest: req,
          rawResponse: res,
        });
      } catch (error) {
        config.logger.error(
          `Error when loading session from storage: ${error}`,
        );
        handleSessionError(req, res, error);
        return undefined;
      }

      let session: Session | undefined;
      if (sessionId) {
        try {
          session = await config.sessionStorage.loadSession(sessionId);
        } catch (error) {
          config.logger.error(
            `Error when loading session from storage: ${error}`,
          );
          res.status(500).send(error.message);
          return undefined;
        }
      }

      let shop =
        api.utils.sanitizeShop(req.query.shop as string) || session?.shop;

      // Check if the session is associated with the same shop as the request
      if (session && shop && session.shop !== shop) {
        config.logger.debug(
          'Found a session for a different shop in the request',
          {
            currentShop: session.shop,
            requestShop: shop,
          },
        );

        return redirectToAuth({req, res, api, config});
      }

      // Validate if the session is active and has a valid access token
      if (session) {
        config.logger.debug('Request session found and loaded', {
          shop: session.shop,
        });

        if (session.isActive(api.config.scopes)) {
          config.logger.debug('Request session exists and is active', {
            shop: session.shop,
          });

          if (await hasValidAccessToken(api, session)) {
            config.logger.debug('Request session has a valid access token', {
              shop: session.shop,
            });

            // Attach the session to the response's locals for further use
            res.locals.shopify = {
              ...res.locals.shopify,
              session,
            };
            return next();
          }
        }
      }

      // Handle Bearer token in Authorization header for API requests
      const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
      if (bearerPresent) {
        if (!shop) {
          shop = await setShopFromSessionOrToken(
            api,
            session,
            bearerPresent[1],
          );
        }
      }

      // Redirect to the authentication flow if the session is not valid
      const redirectUri = `${config.auth.path}?shop=${shop}`;
      config.logger.info(
        `Session was not valid. Redirecting to ${redirectUri}`,
        {shop},
      );

      return redirectOutOfApp({api, config})({
        req,
        res,
        redirectUri,
        shop: shop!,
      });
    };
  };
}

/**
 * Handles session errors by sending the appropriate response to the client.
 *
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Error} error - The error encountered while handling the session.
 */
function handleSessionError(_req: Request, res: Response, error: Error) {
  switch (true) {
    case error instanceof InvalidJwtError:
      res.status(401).send(error.message);
      break;
    default:
      res.status(500).send(error.message);
      break;
  }
}

/**
 * Sets the shop value from the session or token for API requests.
 *
 * @param {Shopify} api - The Shopify API instance.
 * @param {Session | undefined} session - The session object.
 * @param {string} token - The Bearer token from the Authorization header.
 * @returns {Promise<string | undefined>} The shop domain if available.
 */
async function setShopFromSessionOrToken(
  api: Shopify,
  session: Session | undefined,
  token: string,
): Promise<string | undefined> {
  let shop: string | undefined;

  if (session) {
    shop = session.shop;
  } else if (api.config.isEmbeddedApp) {
    const payload = await api.session.decodeSessionToken(token);
    shop = payload.dest.replace('https://', '');
  }
  return shop;
}
