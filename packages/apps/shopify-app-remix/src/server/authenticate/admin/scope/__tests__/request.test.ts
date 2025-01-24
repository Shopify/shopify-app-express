import {LATEST_API_VERSION, SESSION_COOKIE_NAME} from '@shopify/shopify-api';

import {
  APP_URL,
  TEST_SHOP,
  TEST_SHOP_NAME,
  getThrownResponse,
  setUpEmbeddedFlow,
  setUpNonEmbeddedFlow,
  setUpValidSession,
  signRequestCookie,
  testConfig,
  mockGraphqlRequest,
} from '../../../../__test-helpers';
import {shopifyApp} from '../../../..';
import * as redirect from '../../helpers/redirect-to-install-page';

import * as responses from './mock-responses';

it('scopes api is available without any future flags', async () => {
  // GIVEN
  const shopify = shopifyApp(
    testConfig({
      isEmbeddedApp: false,
      scopes: undefined,
      future: {},
    }),
  );
  const session = await setUpValidSession(shopify.sessionStorage);

  const request = new Request(`${APP_URL}/scopes`);
  signRequestCookie({
    request,
    cookieName: SESSION_COOKIE_NAME,
    cookieValue: session.id,
  });

  // WHEN
  const adminApi = await shopify.authenticate.admin(request);

  // THEN
  expect(adminApi).toHaveProperty('scopes');
});

it('when scopes are empty the request is not redirected', async () => {
  // GIVEN
  const {scopes} = await setUpNonEmbeddedFlow();
  const spyRedirect = jest.spyOn(redirect, 'redirectToInstallPage');

  // WHEN
  const response = await scopes.request([]);

  // THEN
  expect(response).toBeUndefined();
  expect(spyRedirect).not.toHaveBeenCalled();
});

it('when all the scopes are already granted the request is not redirected', async () => {
  // GIVEN
  const {scopes} = await setUpNonEmbeddedFlow();
  const spyRedirect = jest.spyOn(redirect, 'redirectToInstallPage');
  await mockGraphqlRequest()({
    status: 200,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN
  const response = await scopes.request(['read_orders', 'write_customers']);

  // THEN
  expect(response).toBeUndefined();
  expect(spyRedirect).not.toHaveBeenCalled();
});

it('when the shop is invalid the query to check the granted scopes returns an error', async () => {
  // GIVEN
  const {scopes, session} = await setUpNonEmbeddedFlow();
  session.shop = `${TEST_SHOP_NAME}.invalid-domain.com`;
  await mockGraphqlRequest(
    LATEST_API_VERSION,
    session.shop,
  )({
    status: 400,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN / THEN
  await expect(scopes.request(['write_products'])).rejects.toEqual(
    expect.objectContaining({
      status: 400,
    }),
  );
});

describe('request from a non embedded app', () => {
  it('redirects to install URL when successful', async () => {
    // GIVEN
    const {scopes, request} = await setUpNonEmbeddedFlow();
    await mockGraphqlRequest()({
      status: 200,
      responseContent: responses.WITH_GRANTED_AND_DECLARED,
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        scopes.request(['write_products', 'read_orders', 'write_customers']),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);
    const locationHeader = response.headers.get('Location');
    expect(locationHeader).not.toBeUndefined();
    const location = new URL(locationHeader!);
    expect(location.hostname).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/install');
    const locationParams = location.searchParams;
    expect(locationParams.get('optional_scopes')).toBe(
      'write_products,read_orders,write_customers',
    );
  });
});

describe('request from an embedded app', () => {
  it('redirects to install URL when successful', async () => {
    // GIVEN
    const {scopes, request} = await setUpEmbeddedFlow();
    await mockGraphqlRequest()({
      status: 200,
      responseContent: responses.WITH_GRANTED_AND_DECLARED,
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        scopes.request(['write_products', 'read_orders', 'write_customers']),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);
    const reuthorizeHeader = response.headers.get(
      'x-shopify-api-request-failure-reauthorize-url',
    );
    expect(reuthorizeHeader).not.toBeUndefined();
    const location = new URL(reuthorizeHeader!);
    expect(location.hostname).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/install');
    const locationParams = location.searchParams;
    expect(locationParams.get('optional_scopes')).toBe(
      'write_products,read_orders,write_customers',
    );
  });
});
