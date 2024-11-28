import {
  InvalidJwtError,
  InvalidShopError,
  RequestedTokenType,
  Session,
  ShopifyRestResources,
  WebhookValidationErrorReason,
} from '@shopify/shopify-api';

import {AppConfigArg} from '../../config-types';
import type {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients';
import {createOrLoadOfflineSession, getSessionTokenHeader} from '../helpers';

import type {
  AuthenticateWebhook,
  WebhookContext,
  WebhookContextWithoutSession,
} from './types';

export function authenticateWebhookFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources,
  Topics extends string,
>(params: BasicParams): AuthenticateWebhook<ConfigArg, Resources, Topics> {
  const {api, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<WebhookContext<ConfigArg, Resources, Topics>> {
    if (request.method !== 'POST') {
      logger.debug(
        'Received a non-POST request for a webhook. Only POST requests are allowed.',
        {url: request.url, method: request.method},
      );
      throw new Response(undefined, {
        status: 405,
        statusText: 'Method not allowed',
      });
    }

    const rawBody = await request.text();

    const check = await api.webhooks.validate({
      rawBody,
      rawRequest: request,
    });

    if (!check.valid) {
      if (check.reason === WebhookValidationErrorReason.InvalidHmac) {
        logger.debug('Webhook HMAC validation failed', check);
        throw new Response(undefined, {
          status: 401,
          statusText: 'Unauthorized',
        });
      } else {
        logger.debug('Webhook validation failed', check);
        throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
      }
    }

    let session = await createOrLoadOfflineSession(check.domain, params);

    /**
     * Most of the time the session should be in the database.
     * There are two exceptions:
     *
     * 1) DB issues
     * Let's say the developer dropped a table, or the DB is not available.
     * This is an error state that's recoverable using token exchange.
     *
     * 2) SHOP_REDACT
     * The app_uninstall webhook fired, the app deleted it's session,
     * shop_redact fired up to 48 hours later.
     * This is a legitimate situation, not an error state.
     * It's not recoverable using token exchange since the app is uninstalled.
     */
    if (!session && check.topic !== 'SHOP_REDACT') {
      const idToken = getSessionTokenHeader(request);

      if (idToken) {
        session = await getSessionFromTokenExchange(
          params,
          idToken,
          check.domain,
        );
      }
    }

    const webhookContext: WebhookContextWithoutSession<Topics> = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      subTopic: check.subTopic || undefined,
      session: undefined,
      admin: undefined,
    };

    if (session) {
      return {
        ...webhookContext,
        session,
        admin: adminClientFactory<ConfigArg, Resources>({
          params,
          session,
        }),
      };
    }

    return webhookContext;
  };
}

async function getSessionFromTokenExchange(
  params: BasicParams,
  idToken: string,
  shop: string,
): Promise<Session | undefined> {
  const {api, config} = params;

  try {
    const {session} = await api.auth.tokenExchange({
      shop,
      sessionToken: idToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    });

    /**
     * We may be in this code path because the DB has availability issues
     *
     * By catching we prevent the same DB issues from rejecting the request
     * and the Remix action that called this code will still get Webhook context.
     * There just won't be a session and that's ok, since webhooks can fire after uninstall.
     * */
    try {
      await config.sessionStorage!.storeSession(session);
    } catch (error) {
      api.logger.error('Failed to store session after token exchange', {error});
    }

    return session;
  } catch (error) {
    /**
     * InvalidJwtError or InvalidShopError means the request can't be trusted
     * api.webhooks.validate() should reject any request that would trigger
     * a InvalidJwtError or InvalidShopError. So this is just a belts and braces.
     * If any other error is thrown, it's ok, we just can't create a new session.
     * That's ok since webhooks can fire after the app is uninstalled.
     */
    if (error instanceof InvalidJwtError || error instanceof InvalidShopError) {
      api.logger.error('Webhook validation failed. Invalid JWT', {error});
      throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
    }

    return undefined;
  }
}
