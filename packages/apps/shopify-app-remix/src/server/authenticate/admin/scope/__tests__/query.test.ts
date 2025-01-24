import {
  APP_URL,
  TEST_SHOP,
  expectExitIframeRedirect,
  getThrownResponse,
  mockGraphqlRequest,
  setUpEmbeddedFlow,
  setUpFetchFlow,
  setUpNonEmbeddedFlow,
} from '../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../const';

import * as responses from './mock-responses';

it('returns scopes information', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequest()({
    status: 200,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN
  const result = await scopes.query();
  // THEN
  expect(result).not.toBeUndefined();
  expect(result.granted).toEqual([
    'read_orders',
    'read_reports',
    'read_products',
    'read_customers',
    'write_customers',
  ]);
  expect(result.required).toEqual([
    'read_orders',
    'read_reports',
    'read_products',
  ]);
  expect(result.optional).toEqual(['write_customers', 'write_products']);
});

it('redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  const requestMock = await mockGraphqlRequest()({status: 401});

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.query(),
    requestMock,
  );

  // THEN
  expectExitIframeRedirect(response);
});

it('returns app bridge redirection during request headers when Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow({
    unstable_newEmbeddedAuthStrategy: false,
  });
  const requestMock = await mockGraphqlRequest()({status: 401});

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.query(),
    requestMock,
  );

  // THEN
  expect(response.status).toEqual(302);

  const {origin, pathname, searchParams} = new URL(
    response.headers.get(REAUTH_URL_HEADER)!,
  );
  expect(origin).toEqual(APP_URL);
  expect(pathname).toEqual('/auth');
  expect(searchParams.get('shop')).toEqual(TEST_SHOP);
});

it('returns a normal redirection when the app is non embedded and Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpNonEmbeddedFlow();
  const requestMock = await mockGraphqlRequest()({status: 401});

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.query(),
    requestMock,
  );

  // THEN
  expect(response.status).toEqual(302);

  const {hostname, pathname} = new URL(response.headers.get('Location')!);
  expect(hostname).toEqual(TEST_SHOP);
  expect(pathname).toEqual('/admin/oauth/authorize');
});

it('return an unexpected error when there is no authentication error', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow({
    unstable_newEmbeddedAuthStrategy: false,
  });
  await mockGraphqlRequest()({status: 500});

  // WHEN / THEN
  await expect(scopes.query()).rejects.toEqual(
    expect.objectContaining({
      status: 500,
    }),
  );
});
