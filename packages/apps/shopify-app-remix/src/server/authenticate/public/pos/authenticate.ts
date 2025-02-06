import {ShopifyRestResources} from '@shopify/shopify-api';

import {RequestedTokenType} from '../../../../../../shopify-api/dist/ts/lib/auth/types';
import {adminClientFactory} from '../../../clients';
import {BasicParams} from '../../../types';
import {handleClientErrorFactory} from '../../admin/helpers/handle-client-error';
import {getSessionTokenHeader} from '../../helpers/get-session-token-header';
import {authenticateExtensionFactory} from '../extension/authenticate';
import {AppConfigArg} from '../../../config-types';

import type {AuthenticatePOS} from './types';
import {checkBillingFactory} from '../../admin/billing/check';

export function authenticatePOSFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticatePOS {
  const authenticate = authenticateExtensionFactory(
    params,
    'pos',
  ) as AuthenticatePOS;
  const {config, api, logger} = params;

  return async (request: Request) => {
    const {sessionToken, cors} = await authenticate(request);
    const sessionTokenString = getSessionTokenHeader(request);
    const dest = new URL(sessionToken.dest);
    const shop = dest.hostname;

    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, sessionToken.sub)
      : api.session.getOfflineId(shop);

    logger.debug('Loading session from storage', {shop, sessionId});
    let session = sessionId
      ? await config.sessionStorage!.loadSession(sessionId)
      : undefined;

    if (!session) {
      try {
        const newSession = await api.auth.tokenExchange({
          sessionToken: sessionTokenString as string,
          shop,
          requestedTokenType: config.useOnlineTokens
            ? RequestedTokenType.OnlineAccessToken
            : RequestedTokenType.OfflineAccessToken,
        });

        session = newSession.session;
      } catch (error) {
        throw new Response('No session found', {
          status: 500,
        });
      }
    }

    if (!session) {
      throw new Response('No session found', {
        status: 500,
      });
    }

    const admin = adminClientFactory<ConfigArg, Resources>({
      params,
      session,
      handleClientError: handleClientErrorFactory({request}),
    });

    return {
      cors,
      sessionToken,
      admin,
      session,
      billing: {
        check: checkBillingFactory(params, request, session),
      },
    };
  };
}
