import {ConfigInterface} from '../../base-types';
import {throwFailedRequest} from '../../clients/common';
import {DataType} from '../../clients/types';
import {Session} from '../../session/session';
import {fetchRequestFactory} from '../../utils/fetch-request';
import {sanitizeShop} from '../../utils/shop-validator';

import {createSession} from './create-session';
import {AccessTokenResponse} from './types';

export interface ClientCredentialsParams {
  shop: string;
}

const ClientCredentialsGrantType = 'client_credentials';

export type ClientCredentials = (
  params: ClientCredentialsParams,
) => Promise<{session: Session}>;

export function clientCredentials(config: ConfigInterface): ClientCredentials {
  return async ({shop}: ClientCredentialsParams) => {
    const cleanShop = sanitizeShop(config)(shop, true)!;

    const requestConfig = {
      method: 'POST',
      body: JSON.stringify({
        client_id: config.apiKey,
        client_secret: config.apiSecretKey,
        grant_type: ClientCredentialsGrantType,
      }),
      headers: {
        'Content-Type': DataType.JSON,
        Accept: DataType.JSON,
      },
    };

    const postResponse = await fetchRequestFactory(config)(
      `https://${cleanShop}/admin/oauth/access_token`,
      requestConfig,
    );

    const responseData = (await postResponse.json()) as AccessTokenResponse;

    if (!postResponse.ok) {
      throwFailedRequest(responseData, false, postResponse);
    }

    return {
      session: createSession({
        accessTokenResponse: responseData,
        shop: cleanShop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}
