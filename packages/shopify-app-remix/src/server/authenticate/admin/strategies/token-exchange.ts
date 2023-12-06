import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
  Shopify,
} from '@shopify/shopify-api';
import {AppConfig, AppConfigArg} from 'src/server/config-types';
import {BasicParams, ApiConfigWithFutureFlags} from 'src/server/types';

import {respondToInvalidSessionToken} from '../../helpers';
import {triggerAfterAuthHook} from '../helpers';

import {AuthorizationStrategy, SessionContext} from './types';

export class TokenExchangeStrategy<Config extends AppConfigArg>
  implements AuthorizationStrategy
{
  protected api: Shopify<ApiConfigWithFutureFlags<Config['future']>>;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams<Config['future']>) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async respondToOAuthRequests(_request: Request): Promise<void> {}

  public async authenticate(
    request: Request,
    sessionContext: SessionContext,
  ): Promise<Session> {
    const {api, config, logger} = this;
    const {shop, session, sessionToken} = sessionContext;

    if (!sessionToken) throw new InvalidJwtError();

    if (!session || session.isExpired()) {
      logger.info('No valid session found');
      logger.info('Requesting offline access token');
      const {session: offlineSession} = await this.exchangeToken({
        request,
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      await config.sessionStorage.storeSession(offlineSession);

      let newSession = offlineSession;

      if (config.useOnlineTokens) {
        logger.info('Requesting online access token');
        const {session: onlineSession} = await this.exchangeToken({
          request,
          sessionToken,
          shop,
          requestedTokenType: RequestedTokenType.OnlineAccessToken,
        });

        await config.sessionStorage.storeSession(onlineSession);
        newSession = onlineSession;
      }

      try {
        await this.handleAfterAuthHook(
          {api, config, logger},
          newSession,
          request,
          sessionToken,
        );
      } catch (error) {
        throw new Response(undefined, {
          status: 500,
          statusText: 'Internal Server Error',
        });
      }

      return newSession;
    }

    return session!;
  }

  private async exchangeToken({
    request,
    shop,
    sessionToken,
    requestedTokenType,
  }: {
    request: Request;
    shop: string;
    sessionToken: string;
    requestedTokenType: RequestedTokenType;
  }): Promise<{session: Session}> {
    const {api, config, logger} = this;

    try {
      return await api.auth.tokenExchange({
        sessionToken,
        shop,
        requestedTokenType,
      });
    } catch (error) {
      if (
        error instanceof InvalidJwtError ||
        (error instanceof HttpResponseError &&
          error.response.code === 400 &&
          error.response.body?.error === 'invalid_subject_token')
      ) {
        throw respondToInvalidSessionToken({api, config, logger}, request);
      }

      throw new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }

  private async handleAfterAuthHook(
    params: BasicParams,
    session: Session,
    request: Request,
    sessionToken: string,
  ) {
    const {config} = params;
    await config.idempotentPromiseHandler.handlePromise(
      () => {
        return triggerAfterAuthHook(params, session, request);
      },
      {
        promiseIdentifier: sessionToken,
      },
    );
  }
}
