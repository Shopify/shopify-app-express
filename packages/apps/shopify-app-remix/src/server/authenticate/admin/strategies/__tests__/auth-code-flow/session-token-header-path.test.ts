import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../../const';

describe('authorize.session token header path', () => {
  describe('errors', () => {
    describe.each([true, false])('when isOnline: %s', (isOnline) => {
      it(`returns app bridge redirection headers if there is no session`, async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            useOnlineTokens: isOnline,
            future: {unstable_newEmbeddedAuthStrategy: false},
          }),
        );

        // WHEN
        const {token} = getJwt();
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
            headers: {Authorization: `Bearer ${token}`},
          }),
        );

        // THEN
        const {origin, pathname, searchParams} = new URL(
          response.headers.get(REAUTH_URL_HEADER)!,
        );

        expect(response.status).toBe(302);
        expect(origin).toBe(APP_URL);
        expect(pathname).toBe('/auth');
        expect(searchParams.get('shop')).toBe(TEST_SHOP);
      });

      it(`returns app bridge redirection headers if the session is no longer valid`, async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            useOnlineTokens: isOnline,
            scopes: ['otherTestScope'],
            future: {unstable_newEmbeddedAuthStrategy: false},
          }),
        );
        // The session scopes don't match the configured scopes, so it needs to be reset
        await setUpValidSession(shopify.sessionStorage, {isOnline});

        // WHEN
        const {token} = getJwt();
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
            headers: {Authorization: `Bearer ${token}`},
          }),
        );

        // THEN
        const {origin, pathname, searchParams} = new URL(
          response.headers.get(REAUTH_URL_HEADER)!,
        );
        expect(response.status).toBe(302);
        expect(origin).toBe(APP_URL);
        expect(pathname).toBe('/auth');
        expect(searchParams.get('shop')).toBe(TEST_SHOP);
      });
    });
  });
});
