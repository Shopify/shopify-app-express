import {Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../../../..';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  mockExternalRequest,
  setUpValidSession,
  testConfig,
} from '../../../../../__test-helpers';

const USER_ID = 902541635;

describe('authenticate', () => {
  it('performs token exchange when there is no offline session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const [persistedSession] =
      await config.sessionStorage.findSessionsByShop(TEST_SHOP);

    expect(persistedSession).toEqual(session);
    expect(session).toMatchObject({
      accessToken: '123abc-exchanged-from-session-token',
      id: `offline_${TEST_SHOP}`,
      isOnline: false,
      scope: 'read_orders',
      shop: TEST_SHOP,
      state: '',
    });
  });

  it('performs token exchange when existing session has expired', async () => {
    // GIVEN
    const config = testConfig({useOnlineTokens: true});
    const shopify = shopifyApp(config);
    const anHourAgo = new Date(Date.now() - 1000 * 3600);
    await setUpValidSession(shopify.sessionStorage, {
      isOnline: true,
      expires: anHourAgo,
    });

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');
    await mockTokenExchangeRequest(token, 'online');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const [_, onlineSession] =
      await config.sessionStorage.findSessionsByShop(TEST_SHOP);

    expect(onlineSession).toEqual(session);
    expect(session).toMatchObject({
      accessToken: '123abc-exchanged-from-session-token',
      id: `${TEST_SHOP}_${USER_ID}`,
      isOnline: true,
      scope: 'read_orders',
      shop: TEST_SHOP,
      state: '',
      onlineAccessInfo: expect.any(Object),
    });
  });

  it('performs token exchange when existing session is invalid', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);
    const invalidatedSession = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: 'test',
      accessToken: undefined,
      scope: 'testScope',
    });
    await shopify.sessionStorage.storeSession(invalidatedSession);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const [persistedSession] =
      await config.sessionStorage.findSessionsByShop(TEST_SHOP);

    expect(persistedSession).toEqual(session);
    expect(persistedSession).toMatchObject({
      accessToken: '123abc-exchanged-from-session-token',
      id: `offline_${TEST_SHOP}`,
      isOnline: false,
      scope: 'read_orders',
      shop: TEST_SHOP,
      state: '',
    });
  });

  describe.each([true, false])(
    'existing sessions when isOnline: %s',
    (isOnline) => {
      it('returns the context if the session is valid', async () => {
        // GIVEN
        const shopify = shopifyApp({
          ...testConfig({useOnlineTokens: isOnline}),
          future: {removeRest: false},
        });

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(shopify.sessionStorage, {
            isOnline,
          });
        }

        // WHEN
        const {token} = getJwt();
        const {admin, session} = await shopify.authenticate.admin(
          new Request(
            `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
          ),
        );

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
        expect(session.isOnline).toEqual(isOnline);
      });
    },
  );

  test('redirects to bounce page on document request when receiving an invalid subject token response from token exchange API', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockInvalidTokenExchangeRequest('invalid_subject_token');

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const {pathname, searchParams} = new URL(
      response.headers.get('location')!,
      APP_URL,
    );

    expect(response.status).toBe(302);
    expect(pathname).toBe('/auth/session-token');
    expect(searchParams.get('shop')).toBe(TEST_SHOP);
    expect(searchParams.get('host')).toBe(BASE64_HOST);
    expect(searchParams.get('shopify-reload')).toBe(
      `${APP_URL}/?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
    );
  });

  test('throws 302 unauthorized on XHR request when receiving an invalid subject token response from token exchange API', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockInvalidTokenExchangeRequest('invalid_subject_token');

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    // THEN
    expect(response.status).toBe(302);
    expect(
      response.headers.get('X-Shopify-Retry-Invalid-Session-Request'),
    ).toEqual('1');
  });

  test('throws 500 for any other error from token exchange API', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockInvalidTokenExchangeRequest('im_broke', 401);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    // THEN
    expect(response.status).toBe(500);
  });

  test('throws a 500 if afterAuth hook throws an error', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({
      ...config,
      hooks: {
        afterAuth: () => {
          throw new Error('test');
        },
      },
    });

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    expect(response.status).toBe(500);
  });

  test('Runs the afterAuth hooks passing', async () => {
    // GIVEN
    const afterAuthMock = jest.fn();
    const config = testConfig({
      hooks: {
        afterAuth: afterAuthMock,
      },
    });
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    expect(session).toBeDefined();
    expect(afterAuthMock).toHaveBeenCalledTimes(1);
  });

  test('throws a response if afterAuth hook throws a response', async () => {
    // GIVEN
    const config = testConfig();
    const redirectResponse = new Response(null, {status: 302});
    const shopify = shopifyApp({
      ...config,
      hooks: {
        afterAuth: () => {
          throw redirectResponse;
        },
      },
    });

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    expect(response).toBe(redirectResponse);
  });
});

async function mockTokenExchangeRequest(
  sessionToken: any,
  tokenType: 'online' | 'offline' = 'offline',
) {
  const responseBody = {
    access_token: '123abc-exchanged-from-session-token',
    scope: 'read_orders',
  };

  await mockExternalRequest({
    request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET_KEY,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: sessionToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type:
          tokenType === 'offline'
            ? 'urn:shopify:params:oauth:token-type:offline-access-token'
            : 'urn:shopify:params:oauth:token-type:online-access-token',
      }),
    }),
    response:
      tokenType === 'offline'
        ? new Response(JSON.stringify(responseBody))
        : new Response(
            JSON.stringify({
              ...responseBody,
              expires_in: Math.trunc(Date.now() / 1000) + 3600,
              associated_user_scope: 'read_orders',
              associated_user: {
                id: USER_ID,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                email_verified: true,
                account_owner: true,
                locale: 'en',
                collaborator: false,
              },
            }),
          ),
  });
}

async function mockInvalidTokenExchangeRequest(error: string, status = 400) {
  await mockExternalRequest({
    request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
      method: 'POST',
    }),
    response: new Response(
      JSON.stringify({
        error,
      }),
      {
        status,
      },
    ),
  });
}
