import {FeatureEnabled, FutureFlagOptions} from 'future/flags';

import {ConfigInterface, ConfigParams} from '../base-types';

import {decodeIdToken} from './decode-id-token';
import {
  customAppSession,
  getCurrentSessionId,
  getJwtSessionId,
  getOfflineId,
} from './session-utils';

export function shopifySession<
  Config extends ConfigInterface<Params>,
  Params extends ConfigParams<any, Future>,
  Future extends FutureFlagOptions = Config['future'],
>(config: Config): ShopifySession<Config> {
  const session:
    | ShopifySessionInterface
    | ShopifySessionInterfaceWithLegacyDecodeSessionToken = {
    customAppSession: customAppSession(config),
    getCurrentId: getCurrentSessionId(config),
    getOfflineId: getOfflineId(config),
    getJwtSessionId: getJwtSessionId(config),
    decodeIdToken: decodeIdToken(config),
  };

  if (usesLegacyDecodeSessionToken(session, config)) {
    session.decodeSessionToken = decodeIdToken(config);
  }

  return session as ShopifySession<Config>;
}

interface SessionConfigArg<Future extends FutureFlagOptions>
  extends ConfigInterface {
  future: Future;
}

function usesLegacyDecodeSessionToken<
  Config extends SessionConfigArg<Future>,
  Future extends FutureFlagOptions,
>(
  _session:
    | ShopifySessionInterface
    | ShopifySessionInterfaceWithLegacyDecodeSessionToken,
  config: Config,
): _session is ShopifySessionInterfaceWithLegacyDecodeSessionToken {
  return !config?.future?.decodeIdToken;
}

interface ShopifySessionInterface {
  customAppSession: ReturnType<typeof customAppSession>;
  getCurrentId: ReturnType<typeof getCurrentSessionId>;
  getOfflineId: ReturnType<typeof getOfflineId>;
  getJwtSessionId: ReturnType<typeof getJwtSessionId>;
  decodeIdToken: ReturnType<typeof decodeIdToken>;
}

interface ShopifySessionInterfaceWithLegacyDecodeSessionToken
  extends ShopifySessionInterface {
  /**
   * @deprecated Use `decodeIdToken` instead.
   */
  decodeSessionToken: ReturnType<typeof decodeIdToken>;
}

export type ShopifySession<Config extends ConfigInterface> =
  FeatureEnabled<Config['future'], 'decodeIdToken'> extends true
    ? ShopifySessionInterface
    : ShopifySessionInterfaceWithLegacyDecodeSessionToken;
