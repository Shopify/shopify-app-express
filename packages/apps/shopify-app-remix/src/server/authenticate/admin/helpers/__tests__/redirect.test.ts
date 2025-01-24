import {SESSION_COOKIE_NAME} from '@shopify/shopify-api';

import {shopifyApp} from '../../../..';
import {
  API_KEY,
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  TEST_SHOP_NAME,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from '../../../../__test-helpers';
import {APP_BRIDGE_URL, REAUTH_URL_HEADER} from '../../../const';

describe('Redirect helper', () => {
  describe("passes request search params to redirect, but doesn't override them", () => {
    it('when URL is a relative path', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect('/?shop=override');

      // THEN
      searchParams.set('shop', 'override');
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${APP_URL}/?${searchParams}`,
      );
    });

    it('when URL is absolute', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect(`${APP_URL}/test?shop=override`, {
        status: 304,
      });

      // THEN
      searchParams.set('shop', 'override');
      expect(response.status).toBe(304);
      expect(response.headers.get('location')).toBe(
        `${APP_URL}/test?${searchParams}`,
      );
    });
  });

  it('does not alter external URLs', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage);

    const {request} = documentLoadRequest(true);
    const {redirect} = await shopify.authenticate.admin(request);

    // WHEN
    const response = redirect('https://www.example.local?test');

    // THEN
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      'https://www.example.local/?test',
    );
  });

  it('parses shopify admin routes and defaults to _parent for embedded apps', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({isEmbeddedApp: true}));
    await setUpValidSession(shopify.sessionStorage);

    const {request} = documentLoadRequest(true);
    const {redirect} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => redirect('shopify://admin/products'),
      request,
    );

    // THEN
    await assertAppBridgeScript(
      response,
      `https://admin.shopify.com/store/${TEST_SHOP_NAME}/products`,
      '_parent',
    );
  });

  describe('and the target is _self', () => {
    it('returns a 302 on embedded document loads', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect('/');

      // THEN
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${APP_URL}/?${searchParams}`,
      );
    });

    it('returns an app bridge script on bounce requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = bounceRequest();
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('/'),
        request,
      );

      // THEN
      await assertAppBridgeScript(
        response,
        `${APP_URL}/?${searchParams}`,
        '_self',
      );
    });

    it("uses Remix's default behaviour for GET data requests", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = remixDataLoadRequest('GET');
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect('/');

      // THEN
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${APP_URL}/`);
    });

    it("uses Remix's default behaviour for POST data requests", async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = remixDataLoadRequest('POST');
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect('/');

      // THEN
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${APP_URL}/`);
    });

    it('parses shopify admin routes and respects target init', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = redirect('shopify://admin/products', {target: '_self'});

      // THEN
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `https://admin.shopify.com/store/${TEST_SHOP_NAME}/products`,
      );
    });
  });

  describe('and the target is _parent', () => {
    it('returns an app bridge redirect on embedded document loads', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('/', {target: '_parent'}),
        request,
      );

      // THEN
      await assertAppBridgeScript(
        response,
        `${APP_URL}/?${searchParams}`,
        '_parent',
      );
    });

    it('returns an app bridge script on bounce requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = bounceRequest();
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('/', {target: '_parent'}),
        request,
      );

      // THEN
      await assertAppBridgeScript(
        response,
        `${APP_URL}/?${searchParams}`,
        '_parent',
      );
    });

    it('returns AB redirection headers for GET data requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = remixDataLoadRequest('GET');
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('/', {target: '_parent'}),
        request,
      );

      // THEN
      await assertAppBridgeHeaders(response, `${APP_URL}/`);
    });

    it('returns AB redirection headers for POST data requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = remixDataLoadRequest('POST');
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('/', {target: '_parent'}),
        request,
      );

      // THEN
      await assertAppBridgeHeaders(response, `${APP_URL}/`);
    });
  });

  describe('and the target is _top', () => {
    it('parses shopify admin routes', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () => redirect('shopify://admin/products/', {target: '_top'}),
        request,
      );

      // THEN
      await assertAppBridgeScript(
        response,
        `https://admin.shopify.com/store/${TEST_SHOP_NAME}/products/`,
        '_top',
      );
    });

    it('parses shopify admin routes and removes embedded params, and leaves other params', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      const {request, searchParams} = documentLoadRequest(true);
      const {redirect} = await shopify.authenticate.admin(request);

      // WHEN
      const response = await getThrownResponse(
        async () =>
          redirect(`shopify://admin/products?${searchParams}&extra=param`, {
            target: '_top',
          }),
        request,
      );

      // THEN
      await assertAppBridgeScript(
        response,
        `https://admin.shopify.com/store/${TEST_SHOP_NAME}/products?extra=param`,
        '_top',
      );
    });
  });

  function documentLoadRequest(embedded: boolean) {
    const {token} = getJwt();
    const searchParams = new URLSearchParams({
      shop: TEST_SHOP,
      embedded: embedded ? '1' : '0',
      host: BASE64_HOST,
      id_token: token,
    });

    return {request: new Request(`${APP_URL}?${searchParams}`), searchParams};
  }

  function bounceRequest() {
    const {token} = getJwt();
    const searchParams = new URLSearchParams({
      shop: TEST_SHOP,
      embedded: '1',
      host: BASE64_HOST,
    });

    return {
      request: new Request(`${APP_URL}?${searchParams}`, {
        headers: {Authorization: `Bearer ${token}`, 'X-Shopify-Bounce': '1'},
      }),
      searchParams,
    };
  }

  function remixDataLoadRequest(method: string) {
    const {token} = getJwt();

    return {
      request: new Request(APP_URL, {
        headers: {Authorization: `Bearer ${token}`},
        method,
      }),
    };
  }

  async function assertAppBridgeScript(
    response: Response,
    url: string,
    target: string,
  ) {
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain(
      `<script data-api-key="${API_KEY}" src="${APP_BRIDGE_URL}"></script>`,
    );
    expect(body).toContain(
      `<script>window.open("${url}", "${target}")</script>`,
    );
  }

  async function assertAppBridgeHeaders(response: Response, url: string) {
    expect(response.status).toBe(302);
    expect(response.headers.get(REAUTH_URL_HEADER)).toBe(url);
  }

  describe('when not embedded', () => {
    it('is not returned as part of the context', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig({isEmbeddedApp: false}));
      const testSession = await setUpValidSession(shopify.sessionStorage);

      const request = new Request(APP_URL);
      signRequestCookie({
        request,
        cookieName: SESSION_COOKIE_NAME,
        cookieValue: testSession.id,
      });

      // WHEN
      const context = await shopify.authenticate.admin(request);

      // THEN
      expect(context).not.toHaveProperty('redirect');
    });
  });
});
