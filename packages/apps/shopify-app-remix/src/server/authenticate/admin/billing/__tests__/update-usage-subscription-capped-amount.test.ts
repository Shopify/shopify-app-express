import {
  BillingConfigSubscriptionLineItemPlan,
  BillingError,
  BillingInterval,
  HttpResponseError,
  SESSION_COOKIE_NAME,
} from '@shopify/shopify-api';

import {shopifyApp} from '../../../..';
import {
  APP_URL,
  BASE64_HOST,
  GRAPHQL_URL,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
  mockExternalRequest,
  mockExternalRequests,
} from '../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../const';

import * as responses from './mock-responses';

const BILLING_CONFIG = {
  [responses.PLAN_1]: {
    lineItems: [
      {
        amount: 5,
        currencyCode: 'USD',
        interval: BillingInterval.Usage,
        terms: 'Usage based',
      },
    ],
  } as BillingConfigSubscriptionLineItemPlan,
};

describe('Update usage billing plan capped amount', () => {
  it('redirects to confirmation URL when successful and at the top level for non-embedded apps', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({isEmbeddedApp: false, billing: BILLING_CONFIG}),
    );
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
      ),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get('Location')).toEqual(
      responses.CONFIRMATION_URL,
    );
  });

  it('redirects to exit-iframe with payment confirmation URL when successful using app bridge when embedded', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
      ),
    });

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expectExitIframeRedirect(response, {
      destination: responses.CONFIRMATION_URL,
      addHostToExitIframePath: false,
    });
  });

  it('returns redirection headers when successful during fetch requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
      ),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);
    expect(response.headers.get(REAUTH_URL_HEADER)).toEqual(
      responses.CONFIRMATION_URL,
    );
  });

  it('redirects to authentication when at the top level when Shopify invalidated the session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(
      testConfig({isEmbeddedApp: false, billing: BILLING_CONFIG}),
    );
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  it('redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({...config, billing: BILLING_CONFIG});
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    const shopSession = await config.sessionStorage.loadSession(
      `offline_${TEST_SHOP}`,
    );
    expect(shopSession).toBeDefined();
    expect(shopSession!.accessToken).toBeUndefined();
    expectExitIframeRedirect(response);
  });

  it('returns redirection headers during fetch requests when Shopify invalidated the session', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);

    const reauthUrl = new URL(response.headers.get(REAUTH_URL_HEADER)!);
    expect(reauthUrl.origin).toEqual(APP_URL);
    expect(reauthUrl.pathname).toEqual('/auth');
  });

  it('throws errors other than authentication errors', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({isEmbeddedApp: false, billing: BILLING_CONFIG}),
    );
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequests({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {billing} = await shopify.authenticate.admin(request);

    // THEN
    await expect(
      billing.updateUsageCappedAmount({
        subscriptionLineItemId:
          responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
        cappedAmount: {amount: 10, currencyCode: 'USD'},
      }),
    ).rejects.toThrow(HttpResponseError);
  });

  it('throws a BillingError when the response contains user errors', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE_WITH_USER_ERRORS,
      ),
    });

    const {token} = getJwt();
    const {billing} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    await expect(
      billing.updateUsageCappedAmount({
        subscriptionLineItemId:
          responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
        cappedAmount: {amount: 10, currencyCode: 'USD'},
      }),
    ).rejects.toThrow(BillingError);
  });
});
