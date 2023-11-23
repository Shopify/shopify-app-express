import {
  CookieNotFound,
  GraphqlQueryError,
  HttpResponseError,
  InvalidHmacError,
  InvalidOAuthError,
  Session,
  Shopify,
  ShopifyRestResources,
  JwtPayload,
} from '@shopify/shopify-api';
import {redirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';
import {
  beginAuth,
  ensureAppIsEmbeddedIfRequired,
  ensureSessionTokenSearchParamIfRequired,
  redirectToAuthPage,
  redirectToShopifyOrAppRoot,
  redirectWithExitIframe,
  triggerAfterAuthHook,
} from '../helpers';
import {SessionContext} from '../types';
import {AppConfig} from '../../../config-types';
import {getSessionTokenHeader, validateSessionToken} from '../../helpers';

import {AuthorizationStrategy} from './types';

export class AuthCodeFlowStrategy<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> implements AuthorizationStrategy
{
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async respondToOAuthRequests(request: Request): Promise<void | never> {
    const {api, logger, config} = this;

    const url = new URL(request.url);
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;

    if (isAuthRequest || isAuthCallbackRequest) {
      const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
      if (!shop) throw new Response('Shop param is invalid', {status: 400});

      if (isAuthRequest) {
        throw await this.handleAuthBeginRequest(request, shop);
      } else {
        throw await this.handleAuthCallbackRequest(request, shop);
      }
    }

    // If this is a valid request, but it doesn't have a session token header, this is a document request. We need to
    // ensure we're embedded if needed and we have the information needed to load the session.
    if (!getSessionTokenHeader(request)) {
      const params = {api, logger, config};

      await this.ensureInstalledOnShop(request);
      await ensureAppIsEmbeddedIfRequired(params, request);
      await ensureSessionTokenSearchParamIfRequired(params, request);
    }
  }

  public async authenticate(
    request: Request,
    sessionToken: string,
  ): Promise<SessionContext | never> {
    const {api, config, logger} = this;

    const {shop, payload, sessionId} = await this.getSessionTokenContext(
      request,
      sessionToken,
    );

    if (!sessionId) {
      logger.debug('Session id not found in cookies, redirecting to OAuth', {
        shop,
      });
      throw await beginAuth({api, config, logger}, request, false, shop);
    }

    logger.debug('Loading session from storage', {sessionId});

    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session || !session.isActive(config.scopes)) {
      const debugMessage = session
        ? 'Found a session, but it has expired, redirecting to OAuth'
        : 'No session found, redirecting to OAuth';
      logger.debug(debugMessage, {shop});
      await redirectToAuthPage({config, logger, api}, request, shop);
    }

    return {session: session!, token: payload};
  }

  private async ensureInstalledOnShop(request: Request) {
    const {api, config, logger} = this;

    this.validateUrlParams(request);

    const url = new URL(request.url);
    let shop = url.searchParams.get('shop');

    // Ensure app is installed
    logger.debug('Ensuring app is installed on shop', {shop});

    if (!(await this.hasValidOfflineId(request))) {
      logger.info("Could not find a shop, can't authenticate request");
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const offlineSession = await this.getOfflineSession(request);
    const isEmbedded = url.searchParams.get('embedded') === '1';

    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (isEmbedded) {
        redirectWithExitIframe({api, config, logger}, request, shop!);
      } else {
        throw await beginAuth({api, config, logger}, request, false, shop!);
      }
    }

    shop = shop || offlineSession.shop;

    if (config.isEmbeddedApp && !isEmbedded) {
      try {
        logger.debug('Ensuring offline session is valid before embedding', {
          shop,
        });
        await this.testSession(offlineSession);

        logger.debug('Offline session is still valid, embedding app', {shop});
      } catch (error) {
        await this.handleInvalidOfflineSession(error, request, shop);
      }
    }
  }

  private validateUrlParams(request: Request) {
    const {api, config, logger} = this;

    if (config.isEmbeddedApp) {
      const url = new URL(request.url);
      const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
      if (!shop) {
        logger.debug('Missing or invalid shop, redirecting to login path', {
          shop,
        });
        throw redirect(config.auth.loginPath);
      }

      const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
      if (!host) {
        logger.debug('Invalid host, redirecting to login path', {
          host: url.searchParams.get('host'),
        });
        throw redirect(config.auth.loginPath);
      }
    }
  }

  private async getSessionTokenContext(request: Request, sessionToken: string) {
    const {api, config, logger} = this;

    let shop: string;
    let payload: JwtPayload | undefined;
    let sessionId: string | undefined;

    if (config.isEmbeddedApp) {
      payload = await validateSessionToken({config, logger, api}, sessionToken);
      const dest = new URL(payload.dest);
      shop = dest.hostname;

      logger.debug('Session token is present, validating session', {shop});
      sessionId = config.useOnlineTokens
        ? api.session.getJwtSessionId(shop, payload.sub)
        : api.session.getOfflineId(shop);
    } else {
      const url = new URL(request.url);
      shop = url.searchParams.get('shop')!;

      sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
    }

    return {shop, payload, sessionId};
  }

  private async handleAuthBeginRequest(
    request: Request,
    shop: string,
  ): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth begin request');

    logger.debug('OAuth request contained valid shop', {shop});

    // If we're loading from an iframe, we need to break out of it
    if (
      config.isEmbeddedApp &&
      request.headers.get('Sec-Fetch-Dest') === 'iframe'
    ) {
      logger.debug('Auth request in iframe detected, exiting iframe', {shop});
      throw redirectWithExitIframe({api, config, logger}, request, shop);
    } else {
      throw await beginAuth({api, config, logger}, request, false, shop);
    }
  }

  private async handleAuthCallbackRequest(
    request: Request,
    shop: string,
  ): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth callback request');

    try {
      const {session, headers: responseHeaders} = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info('Requesting online access token for offline session');
        await beginAuth({api, config, logger}, request, true, shop);
      }

      await triggerAfterAuthHook<Resources>(
        {api, config, logger},
        session,
        request,
      );

      throw await redirectToShopifyOrAppRoot(
        request,
        {api, config, logger},
        responseHeaders,
      );
    } catch (error) {
      if (error instanceof Response) throw error;

      throw await this.oauthCallbackError(error, request, shop);
    }
  }

  private async getOfflineSession(
    request: Request,
  ): Promise<Session | undefined> {
    const {api, config} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');

    const offlineId = shop
      ? api.session.getOfflineId(shop)
      : await api.session.getCurrentId({isOnline: false, rawRequest: request});

    return config.sessionStorage.loadSession(offlineId!);
  }

  private async hasValidOfflineId(request: Request) {
    const {api} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');

    const offlineId = shop
      ? api.session.getOfflineId(shop)
      : await api.session.getCurrentId({isOnline: false, rawRequest: request});

    return Boolean(offlineId);
  }

  private async testSession(session: Session): Promise<void> {
    const {api} = this;

    const client = new api.clients.Graphql({
      session,
    });

    await client.query({
      data: `#graphql
        query shopifyAppShopName {
          shop {
            name
          }
        }
      `,
    });
  }

  private async oauthCallbackError(
    error: Error,
    request: Request,
    shop: string,
  ) {
    const {logger} = this;
    logger.error('Error during OAuth callback', {error: error.message});

    if (error instanceof CookieNotFound) {
      return this.handleAuthBeginRequest(request, shop);
    }

    if (
      error instanceof InvalidHmacError ||
      error instanceof InvalidOAuthError
    ) {
      return new Response(undefined, {
        status: 400,
        statusText: 'Invalid OAuth Request',
      });
    }

    return new Response(undefined, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }

  private async handleInvalidOfflineSession(
    error: Error,
    request: Request,
    shop: string,
  ) {
    const {api, logger, config} = this;
    if (error instanceof HttpResponseError) {
      if (error.response.code === 401) {
        logger.info('Shop session is no longer valid, redirecting to OAuth', {
          shop,
        });
        throw await beginAuth({api, config, logger}, request, false, shop);
      } else {
        const message = JSON.stringify(error.response.body, null, 2);
        logger.error(`Unexpected error during session validation: ${message}`, {
          shop,
        });

        throw new Response(undefined, {
          status: error.response.code,
          statusText: error.response.statusText,
        });
      }
    } else if (error instanceof GraphqlQueryError) {
      const context: {[key: string]: string} = {shop};
      if (error.response) {
        context.response = JSON.stringify(error.response);
      }

      logger.error(
        `Unexpected error during session validation: ${error.message}`,
        context,
      );

      throw new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }
}
