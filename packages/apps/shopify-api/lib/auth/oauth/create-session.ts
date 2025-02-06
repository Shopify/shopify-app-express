import {v4 as uuidv4} from 'uuid';

import {Session} from '../../session/session';
import {ConfigInterface} from '../../base-types';
import {logger} from '../../logger';
import {getJwtSessionId, getOfflineId} from '../../session/session-utils';

import {
  AccessTokenResponse,
  OnlineAccessResponse,
  OnlineAccessInfo,
  OfflineAccessResponse,
} from './types';

export function createSession({
  config,
  accessTokenResponse,
  shop,
  state,
}: {
  config: ConfigInterface;
  accessTokenResponse: AccessTokenResponse;
  shop: string;
  state: string;
}): Session {
  const associatedUser = (accessTokenResponse as OnlineAccessResponse)
    .associated_user;
  const isOnline = Boolean(associatedUser);

  logger(config).info('Creating new session', {shop, isOnline});

  const getSessionExpiration = (expires_in: number) =>
    new Date(Date.now() + expires_in * 1000);

  const getOnlineSessionProperties = (responseBody: OnlineAccessResponse) => {
    const {access_token, scope, ...rest} = responseBody;
    const sessionId = config.isEmbeddedApp
      ? getJwtSessionId(config)(
          shop,
          `${(rest as OnlineAccessInfo).associated_user.id}`,
        )
      : uuidv4();

    return {
      id: sessionId,
      onlineAccessInfo: rest,
      expires: getSessionExpiration(rest.expires_in),
    };
  };

  const getOfflineSessionProperties = (responseBody: OfflineAccessResponse) => {
    const {expires_in} = responseBody;
    return {
      id: getOfflineId(config)(shop),
      ...(expires_in && {expires: getSessionExpiration(expires_in)}),
    };
  };

  return new Session({
    shop,
    state,
    isOnline,
    accessToken: accessTokenResponse.access_token,
    scope: accessTokenResponse.scope,
    ...(isOnline
      ? getOnlineSessionProperties(accessTokenResponse as OnlineAccessResponse)
      : getOfflineSessionProperties(
          accessTokenResponse as OfflineAccessResponse,
        )),
  });
}
