# @shopify/shopify-app-remix

## 3.7.2

### Patch Changes

- b83364c: Updated `semver` dependencies
- Updated dependencies [7aaa0a8]
  - @shopify/shopify-api@11.8.2
  - @shopify/shopify-app-session-storage@3.0.13
  - @shopify/admin-api-client@1.0.6
  - @shopify/storefront-api-client@1.0.5

## 3.7.1

### Patch Changes

- Updated dependencies [7ff4467]
  - @shopify/shopify-api@11.8.1
  - @shopify/shopify-app-session-storage@3.0.12

## 3.7.0

### Minor Changes

- 89d803e: # Adds signal as request option

  This adds the `signal` option to the `request` method of the GraphQL client, for the shopify-api and shopify-app-remix packages to pass in an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to abort requests, and set a timeout.

  If a request is aborted, an `HttpRequestError` will be thrown.

  This will allow you to set your own custom timeout, and abort requests.

  ```ts
  // Abort the request after 3 seconds
  await admin.graphql('{ shop { name } }', {
    signal: AbortSignal.timeout(3000),
  });
  ```

  ```ts
  // Abort the request after 3 seconds, and retry the request up to 2 times
  await admin.graphql('{ shop { name } }', {
    signal: AbortSignal.timeout(3000),
    tries: 2,
  });
  ```

- 724f3d9: # Function to authenticate POS UI extension requests

  A new API had been added to the `authenticate` module to authenticate POS UI extension requests.

  The `authenticate.public.pos` function is now available to authenticate POS UI extension requests.

  It returns the session token that was sent with the request and a `cors` function to ensure your app can respond to POS UI extension requests.

  ```ts
  //app/routes/pos.jsx
  import { authenticate } from "../shopify.server";
  export const action = async ({ request }) => {

          const {sessionToken } = await authenticate.public.pos(request);
          console.log(sessionToken, "sessionToken");

      return "hello world"
  }

  // extensions/pos-ui/src/Modal.jsx
  import React, { useEffect, useState } from 'react'

  import { Text, Screen, ScrollView, Navigator, reactExtension, useApi } from '@shopify/ui-extensions-react/point-of-sale'

  const Modal = () => {
    const api = useApi()
    const {getSessionToken} = api.session;
    const [token, setToken] = useState('');
    const [result, setResult] = useState('');

    useEffect(() => {
      const fetchToken = async () => {
        const newToken = await getSessionToken();
        setToken(newToken);
        await fetchWithToken(newToken);
      };

      async function fetchWithToken(token) {
        const result = await fetch(
          'https://decor-plasma-showtimes-beverages.trycloudflare.com/pos',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Add your POST data here
          },
        );
        const resultJson = await result.json();
        setResult(resultJson);
      }

     fetchToken();
    }, []); // Empty dependency array means this runs once on mount

    return (
      <Navigator>
        <Screen name="HelloWorld" title="Hello World!">
          <ScrollView>
            <Text>Welcome to the extension</Text>
            <Text> The result is: {JSON.stringify(result)}</Text>
          </ScrollView>
        </Screen>
      </Navigator>
    )
  }

  export default reactExtension('pos.home.modal.render', () => <Modal />);
  ```

### Patch Changes

- 32b86a3: Updated `@remix-run/server-runtime` dependencies
- 54eb408: Updated `isbot` dependencies
- a573a6c: Updated `isbot` dependencies
- Updated dependencies [54eb408]
- Updated dependencies [a573a6c]
- Updated dependencies [409597b]
- Updated dependencies [89d803e]
  - @shopify/shopify-api@11.8.0
  - @shopify/shopify-app-session-storage@3.0.11
  - @shopify/admin-api-client@1.0.5
  - @shopify/storefront-api-client@1.0.4

## 3.6.0

### Minor Changes

- 34fc75d: Add Shop context to logging

### Patch Changes

- 6681802: Updated `isbot` dependencies
- Updated dependencies [6b71f39]
- Updated dependencies [6681802]
- Updated dependencies [dc6b8ad]
  - @shopify/shopify-api@11.7.0
  - @shopify/shopify-app-session-storage@3.0.10

## 3.5.1

### Patch Changes

- 62b533e: Revert shop logging

## 3.5.0

### Minor Changes

- 7147103: Add Scopes API documentation for Remix
- 4bba5d4: Added `removeRest` future flag.

  When `removeRest` is `true`, the REST API will no longer be available. Please use the GraphQL API instead. See [Shopify is all-in on graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql) for more information.

  If your app doesn't use the REST API, you can safely set `removeRest` to `true` and be ready for a future major release. If your app does use the REST API, you should migrate to the GraphQL API and then set `removeRest` to `true`.

- 301882d: Update logging to include Shop information
- dc75db6: Remove `wip_optionalScopesApi` future flag and enable [the Remix Scopes API](https://shopify.dev/docs/api/shopify-app-remix/v3/apis/scopes) by default.

  Example of checking for a granted scope on a shop with `scopes.query()`:

  ```ts
  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { scopes } = await authenticate.admin(request);

    const scopesDetail =  await scopes.query();

    return json({
      hasWriteProducts: scopesDetail.granted.includes('write_products'),
    });
  };

  export default function Index() {
    const {hasWriteProducts} = useLoaderData<typeof loader>();

    ...
  }
  ```

  See the [Remix Scopes API documentation](https://shopify.dev/docs/api/shopify-app-remix/v3/apis/scopes) for more details on this API, and the [Manage Access Scopes page](https://shopify.dev/docs/apps/build/authentication-authorization/app-installation/manage-access-scopes) on shopify.dev for more context how the Scopes APIs can be used to manage access scopes from one shop to another.

### Patch Changes

- Updated dependencies [6910d3d]
  - @shopify/shopify-api@11.6.1
  - @shopify/shopify-app-session-storage@3.0.9

## 3.4.0

### Minor Changes

- 9b217e5: Adds API to update the capped amount for a usage billing plan.

  A new billing helper function has been added to update the capped amount for a usage billing plan. This function redirects to a confirmation page where the merchant can confirm the update.

  ```ts
  await billing.updateUsageCappedAmount({
    subscriptionLineItemId:
      'gid://shopify/AppSubscriptionLineItem/12345?v=1&index=1',
    cappedAmount: {
      amount: 10,
      currencyCode: 'USD',
    },
  });
  ```

  Learn more about [App Billing](https://shopify.dev/docs/apps/launch/billing/subscription-billing).

### Patch Changes

- 59896e3: Updated `isbot` dependencies
- 5c01460: Adding toggle parameter flag to return implied scopes from Remix API Query by returning original scopes from AuthScopes instantiation

  Example:
  const scopes = new AuthScopes(['read_customers', 'write_customers', 'read_products', 'write_channels']);
  scopes.toArray() returns ['write_customers', 'read_products', 'write_channels']
  scopes.toArray(true) returns ['read_customers', 'write_customers', 'read_products', 'write_channels']

- Updated dependencies [50634c0]
- Updated dependencies [59896e3]
- Updated dependencies [2e396f3]
- Updated dependencies [5efb3a2]
- Updated dependencies [cd0b3e1]
- Updated dependencies [bad62cc]
- Updated dependencies [10f4fd0]
- Updated dependencies [5c01460]
  - @shopify/shopify-api@11.6.0
  - @shopify/shopify-app-session-storage@3.0.8
  - @shopify/admin-api-client@1.0.4
  - @shopify/storefront-api-client@1.0.3

## 3.3.2

### Patch Changes

- 50f8ab0: Updated `@remix-run/server-runtime` dependencies
- Updated dependencies [18ee7e2]
- Updated dependencies [97c31fb]
- Updated dependencies [6bda2fc]
- Updated dependencies [7a2e78a]
  - @shopify/shopify-api@11.5.0
  - @shopify/admin-api-client@1.0.3
  - @shopify/shopify-app-session-storage@3.0.7

## 3.3.1

### Patch Changes

- 2ecb1ac: Add more docs on when to use app-specific vs shop-specific webhooks and which methods/config uses which approach
- Updated dependencies [323bef3]
- Updated dependencies [fb48795]
  - @shopify/shopify-api@11.4.1
  - @shopify/shopify-app-session-storage@3.0.6

## 3.3.0

### Minor Changes

- 4a1ffad: Adds API to create usage records for billing

  A new billing helper function has been added to create usage records for a usage billing plan.

  ```ts
  const chargeBilling = await billing.createUsageRecord({
    description: 'Usage record for product creation',
    price: {
      amount: 1,
      currencyCode: 'USD',
    },
    isTest: true,
  });
  console.log(chargeBilling);
  ```

  Learn more about [App Billing](https://shopify.dev/docs/apps/launch/billing/subscription-billing).

### Patch Changes

- a426889: Exposing override types for `lineItems` in the billing `request` method.
- 8e61a39: setUpValidRequest in shopify-api now preserves headers. Documentation for test helpers now more accurately describes use cases.
- 2266e7f: Return revoked scopes instead of querying for scopes after revoking
- Updated dependencies [4e143ec]
- Updated dependencies [4a1ffad]
- Updated dependencies [a426889]
- Updated dependencies [8e61a39]
  - @shopify/shopify-api@11.4.0
  - @shopify/shopify-app-session-storage@3.0.5
  - @shopify/admin-api-client@1.0.2
  - @shopify/storefront-api-client@1.0.2

## 3.2.0

### Minor Changes

- 8f92455: Test helpers and changes to enable automated unit and e2e testing for @shopify/shopify-app-remix

  See [documentation](../shopify-api/docs/guides/test-helpers.md) for examples on how to use these helper methods.

  ```ts
  import prisma from '~/db.server';
  import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
  import {
    RequestType,
    setUpValidRequest,
    setUpValidSession,
  } from '@shopify/shopify-api/test-helpers';

  // set up test Session
  const sessionStorage = new PrismaSessionStorage(prisma);
  const session = await setUpValidSession({
    shop: getShopValue('test-shop');
  });
  await sessionStorage.storeSession(session);

  let request: Request = ... // the request intercepted by end-to-end testing framework

  const authorizedRequest = setUpValidRequest(
    {
      type: RequestType.Extension,
      store: `test-shop-${process.env.TEST_PARALLEL_INDEX}`,
      apiKey: ..., // the same value as `apiKey` passed to shopifyApi()
      apiSecretKey: ..., // the same value as `apiSecretKey` passed to shopifyApi()
    },
    request
  );

  // use authorizedRequest to complete the request, or use the url or headers of authorizedRequest to modify the original request.

  ... // complete testing here

  // tear down test Session
  await sessionStorage.deleteSession(session.id);
  ```

### Patch Changes

- e944c72: Updated `isbot` dependencies
- 446ef79: Updates the interface of the Scopes API
- edb1515: Fixed an issue with relative URLs in the admin context `redirect` helper, which caused it to fail on Safari.
- 2d5675f: Improved the error message when an empty appUrl configuration is received to remind the developer to set the environment variables.
- Updated dependencies [cf8cc7c]
- Updated dependencies [e944c72]
- Updated dependencies [e9b4f22]
- Updated dependencies [8f92455]
  - @shopify/shopify-api@11.3.0
  - @shopify/shopify-app-session-storage@3.0.4

## 3.1.0

### Minor Changes

- a84dadb: # Add support for merchant custom apps

  Merchant custom apps or apps that are distributed by the Shopify Admin are now supported.

  These apps do not Authorize by OAuth, and instead use a access token that has been generated by the Shopify Admin.

  Apps of this type are standalone apps and are not initiated from the Shopify Admin. Therefore it is **up to the developer of the app to add login and authentication functionality**.

  To use this library with Merchant Custom Apps set the following configuration in the `shopify.server` file:

  ```ts
  const shopify = shopifyApp({
    apiKey: "your-api-key",
    apiSecretKey: "your-api-secret-key",
    adminApiAccessToken:"shpat_1234567890",
    distribution: AppDistribution.ShopifyAdmin,
    appUrl: "https://localhost:3000",
    isEmbeddedApp: false,
  ```

  Session storage is _not_ required for merchant custom apps. A session is created from the provided access token.

  At this time merchant custom apps are not supported by the Shopify CLI. Developers will need to start the development server directly.

  ```sh
  npm exec remix vite:dev
  ```

  You can then access the the app at `http://localhost:3000/app?shop=my-shop.myshopify.com`

- 9cba2d3: Allow responses from afterAuth to bubble up to the Remix loader
- 071ec13: Make session storage optional for merchant custom apps

  Providing a session storage to the `shopifyApp()` function is now optional for apps with a distribution of `AppDistribution.ShopifyAdmin`. Apps with this distribution create the session from the configured access tokens.

- d022f8c: Change `billing.check` and `billing.subscription` to work without a billing config, so apps can use [Shopify managed pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing).
- e69f4a8: # Add Admin path parsing to redirect

  You can now pass in an admin path to the redirect function to redirect to a page in the Shopify Admin. This uses the same syntax App Bridge uses to [redirect](https://shopify.dev/docs/api/app-bridge-library/apis/navigation#example-navigating-to-pages-in-the-shopify-admin) to the Shopify Admin.

  ```ts
  export const action = async ({request}: ActionFunctionArgs) => {
    const {redirect} = await authenticate.admin(request);

    return redirect(`shopify://admin/products/123456`, {target: '_top'});
  };
  ```

- 1aa226b: Return headers in responses from GraphQL client.

  Headers are now returned in the response object from the GraphQL client.

  In apps using the `@shopify/shopify-app-remix` package the headers can be access as follows:

  ```ts
    const response = await admin.graphql(
      ...

    const responseJson = await response.json();
    const responseHeaders = responseJson.headers
    const xRequestID = responseHeaders? responseHeaders["X-Request-Id"] : '';
    console.log(responseHeaders);
    console.log(xRequestID, 'x-request-id');
  ```

### Patch Changes

- 207b9d8: Throw a 500 response instead of a redirect if we detect a redirect loop in /auth/login.
- badbdde: Allow \_blank targets in the redirect helper `target` option.
- Updated dependencies [05fb23d]
- Updated dependencies [192cc6b]
- Updated dependencies [06793fb]
- Updated dependencies [3a0a3d4]
- Updated dependencies [1aa226b]
- Updated dependencies [3cf3c56]
  - @shopify/shopify-api@11.2.0
  - @shopify/shopify-app-session-storage@3.0.3
  - @shopify/admin-api-client@1.0.1
  - @shopify/storefront-api-client@1.0.1

## 3.0.2

### Patch Changes

- 1de1f15: bump jose from 5.4.0 to 5.4.1
- Updated dependencies [1de1f15]
- Updated dependencies [ea7c05d]
  - @shopify/shopify-api@11.1.0
  - @shopify/shopify-app-session-storage@3.0.2

## 3.0.1

### Patch Changes

- 8eafd2b: Fixed creation of nested REST resource objects in the Remix package.
- 07ed16a: Loosen type check on topics to allow declarative webhooks
- Updated dependencies [58fb360]
- Updated dependencies [8eafd2b]
  - @shopify/shopify-api@11.0.1
  - @shopify/shopify-app-session-storage@3.0.1

## 3.0.0

### Major Changes

- 9ae62fc: Remove v3_authenticate_public future flag and enable functionality be default.

  See more details in the [migration guide](./docs/MIGRATION_V3.md).

- 7179ef9: Remove v3_lineItemBilling future flag and enable functionality be default.

  See more details in the [migration guide](./docs/MIGRATION_V3.md).

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.
- b1e6ff0: Remove v3_webhookAdminContext future flag and enable functionality.

  See more details in the [migration guide](./docs/MIGRATION_V3.md).

- f346f03: Apps can no longer import server-side functions using the following statements:

  ```diff
  import '@shopify/shopify-app-remix/adapters/node';
  + import {shopifyApp} from '@shopify/shopify-app-remix';
  ```

  With the addition of React component to this package, we've separated the exports between server and react code, as in:

  ```diff
  import '@shopify/shopify-app-remix/server/adapters/node';
  + import {shopifyApp} from '@shopify/shopify-app-remix/server';
  - import {shopifyApp} from '@shopify/shopify-app-remix';
  import {AppProvider} from '@shopify/shopify-app-remix/react';
  ```

  See more details in the [migration guide](./docs/MIGRATION_V3.md).

### Minor Changes

- a810211: Add API to Authenticate requests from customer account extensions
- 36e3c62: Add support for Node 22.
- 8475ae7: Made it possible to create types for the context objects returned by the various `authenticate` methods from the actual `shopifyApp` object. With this, apps can pass the contexts and their components as function arguments much more easily.

### Patch Changes

- 5c72853: Added debugging for request information when we fail to find a session during app proxy authentication.
- a42efff: Bump isbot from 5.1.4 to 5.1.6
- e305364: Invalidating accessToken instead of deleting the record when handling 401 errors
- 94bb896: Bump semver from 7.6.0 to 7.6.2
- Updated dependencies [d9f2601]
- Updated dependencies [92b6772]
- Updated dependencies [b5a4735]
- Updated dependencies [a42efff]
- Updated dependencies [9749f45]
- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/shopify-api@11.0.0
  - @shopify/admin-api-client@1.0.0
  - @shopify/storefront-api-client@1.0.0
  - @shopify/shopify-app-session-storage@3.0.0

## 2.8.2

### Patch Changes

- 65325b8: Change v10_lineItemBilling flag to lineItemBilling
- fa94e85: Fix an issue that rejected requests from Shopify POS / Mobile due to their User-Agents being labeled as bots.
- 637c6c3: This `scopes` field on the API config object is now optional. If your app is using the new [managed install flow](https://shopify.dev/docs/apps/auth/installation), it is now recommended you omit the `scopes` property from the config object.
- 1b5d80e: Removed `@remix-run/node` as a direct dependency. Any app using the Vercel adapter already needs `@remix-run/node`, so this shouldn't affect any apps.
- Updated dependencies [379206c]
- Updated dependencies [715a120]
- Updated dependencies [65325b8]
- Updated dependencies [637c6c3]
- Updated dependencies [a8d4b3e]
- Updated dependencies [6f1a98e]
- Updated dependencies [61576be]
- Updated dependencies [379206c]
  - @shopify/shopify-api@10.0.0
  - @shopify/storefront-api-client@0.3.4
  - @shopify/shopify-app-session-storage@2.1.5
  - @shopify/admin-api-client@0.2.9

## 2.8.1

### Patch Changes

- 8c97e8a: Updated dependency on isbot
- Updated dependencies [16f52ee]
- Updated dependencies [8c97e8a]
  - @shopify/shopify-api@9.7.2
  - @shopify/shopify-app-session-storage@2.1.4

## 2.8.0

### Minor Changes

- cb656dc: Added `AppProxy` React components to enable JS behind proxies

### Patch Changes

- 9a41180: Fixed an issue where full page reloads broke HMR on pages loaded for more than a minute
- 4aa4b59: Bump shopify-api to v9.6.0
- 883fe7b: Bumps @shopify/shopify-api to v9.6.2
- 753d406: Update @shopify/shopify-api to v9.7.1
- Updated dependencies [4aa4b59]
- Updated dependencies [883fe7b]
- Updated dependencies [753d406]
  - @shopify/shopify-app-session-storage@2.1.3

## 2.7.0

### Minor Changes

- 6e45991: Adds an API to authenticate fulfillment service notifications

  Learn more about [fulfillment service apps](https://shopify.dev/docs/apps/fulfillment/fulfillment-service-apps/manage-fulfillments).

  ```
  //app/routes/fulfillment_order_notification.jsx

  import { authenticate } from "../shopify.server";

  export const action = async ({ request }) => {
      const { admin, payload } = await authenticate.fulfillmentService(request);

      if (!admin) {
        throw new Response();
      }
      console.log(payload.kind, 'kind'); //FULFILLMENT_REQUEST
      throw new Response();
    };
  ```

### Patch Changes

- 674f6e3: Show an INFO log for disabled future flags to encourage apps to migrate ahead of time, making major version bumps simpler.
- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- 5aecf7d: Make `authenticate.webhook` return type's `payload` field more flexible, so apps aren't required to cast every value.
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 2.6.1

### Patch Changes

- c95cfdf: Update AppConfig type to Readonly. The config should not be modified after it is created.
- 6deb1bd: Updated dependency on `semver`

## 2.6.0

### Minor Changes

- 1002934: Add new v3_lineItemBilling future flag

  With this future flag you can configure billing plans to have multiple line items, eg. a recurring plan and a usage based plan.

  ```ts
  //shopify.server.ts
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
         {
           amount: 5,
           currencyCode: 'USD',
           interval: BillingInterval.Every30Days,
          }
          {
              amount: 1,
              currencyCode: 'USD',
              interval: BillingInterval.Usage
              terms: "1 dollar per 1000 emails",
          }
        ],
      },
    },
    future: {v3_lineItemBilling: true}
  });
  export default shopify;
  export const authenticate = shopify.authenticate;

  ```

- 956f493: Allow subscribing to webhooks with sub-topics
- 6df84d2: Introduce Vercel adapter to fix deploys to Vercel.

  Since v.9.0.0 of `@shopify/shopify-api` developers deploying their Remix apps to Vercel have encountered errors.

  Developers looking to deploy their application to Vercel should replace references to import `"@shopify/shopify-app-remix/adapters/node";` with `"@shopify/shopify-app-remix/adapters/vercel";` to properly load the required global variables.

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- 7787a1a: Fix billing redirect issue when using the new embedded auth strategy
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 2.5.1

### Patch Changes

- 22b7744: Throw error when attempting to exit-iframe with an invalid URL

## 2.5.0

### Minor Changes

- 6d5b4e0: Add check function to the billing API
- ba3eff7: Added a new method `shopify.authenticate.flow(request)`, which will validate a Flow extension request, and return the payload / API clients to the app.
- da09f4e: Add SessionNotFoundError for unauthenticated requests
- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- 8811faa: Updated the `@shopify/admin-api-client` dependency
- f5742c1: Updated dependency on `@shopify/shopify-api`
- d0a5483: Remove references to unstable_tokenExchange
- 37dff44: Updated Remix dependencies to v2.5.1
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 2.4.0

### Minor Changes

- 2473c85: Add new embedded authorization strategy relying on Shopify managed install and OAuth token exchange

  :exclamation: For more information on how to enable this feature, see ["New Embedded Authorization Strategy"](./README.md#new-embedded-authorization-strategy)

### Patch Changes

- 35b74dd: Fixes a bug that was causing external redirects to fail in remix actions
- 42013e8: Minor refactor in login.ts to use new URL util method from shopify-api-js
- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- b998c30: Handle webhook registration throttling error
- f445164: Use 'body' field from GraphqlQueryError when logging session validation error
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage@2.0.4

## 2.3.0

### Minor Changes

- a9c7836: Adding support for the new clients from `@shopify/admin-api-client` and `@shopify/storefront-api-client` that can leverage `@shopify/api-codegen-preset` to automatically type GraphQL operations using Codegen.

  For more information on how to add types to your queries, see [the `@shopify/api-codegen-preset` documentation](../../api-clients/api-codegen-preset).

### Patch Changes

- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage@2.0.3

## 2.2.0

### Minor Changes

- d92f828: Refactor AuthStrategy to extract OAuth authorization code flow behaviour into a separate class.

### Patch Changes

- 8c36e82: Fixing a bug in the GraphQL client that could cause specific builds to fail, because we used `query` for both the function and argument names.
- 9d0fc6f: Now `authenticate.webhook(request);` will return 401 Unauthorized when webhook HMAC validation fails.
- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage@2.0.2

## 2.1.0

### Minor Changes

- f34eefd: Added v3_authenticatePublic feature flag to remove `authenticate.public(request)`.

  Apps can opt in to the new future at any time, so this is not a breaking change until version 3.

    <details>
      <summary>See an example</summary>

  Without the `v3_authenticatePublic` future flag the deprecated `authenticate.public(request)` is supported:

  ```ts
  await authenticate.public.checkout(request);
  await authenticate.public.appProxy(request);

  // Deprecated.  Use authenticate.public.checkout(request) instead
  await authenticate.public(request);
  ```

  With the `v3_authenticatePublic` future flag enabled the deprecated `authenticate.public(request)` is not supported:

  ```ts
  await authenticate.public.checkout(request);
  await authenticate.public.appProxy(request);
  ```

    </details>

## 2.0.2

### Patch Changes

- ee7114a: Fixed the errorBoundary to work with new cases in Remix v2. Thank you @btomaj!

## 2.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api
- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage@2.0.1

## 2.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

### Minor Changes

- a1b3393: Added support for `future` flags in the `shopifyApp` function, with a `v3_webhookContext` flag to have `authenticate.webhook` return a standard `admin` context, instead of a different type.

  Apps can opt in to the new future at any time, so this is not a breaking change (yet).

  <details>
    <summary>See an example</summary>

  Without the `v3_webhookContext` flag, `graphql` provides a `query` function that takes the query string as the `data` param.
  When using variables, `data` needs to be an object containing `query` and `variables`.

  ```ts
  import {json, ActionFunctionArgs} from '@remix-run/node';
  import {authenticate} from '../shopify.server';

  export async function action({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.webhook(request);

    const response = await admin?.graphql.query<any>({
      data: {
        query: `#graphql
        mutation populateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
            }
          }
        }`,
        variables: {input: {title: 'Product Name'}},
      },
    });

    const productData = response?.body.data;
    return json({data: productData.data});
  }
  ```

  With the `v3_webhookContext` flag enabled, `graphql` _is_ a function that takes in the query string and an optional settings object, including `variables`.

  ```ts
  import {ActionFunctionArgs} from '@remix-run/node';
  import {authenticate} from '../shopify.server';

  export async function action({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.webhook(request);

    const response = await admin?.graphql(
      `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      {variables: {input: {title: 'Product Name'}}},
    );

    const productData = await response.json();
    return json({data: productData.data});
  }
  ```

  </details>

### Patch Changes

- afb0a7d: Updating Remix dependencies to v2.
- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0

## 1.3.0

### Minor Changes

- 6ac6832: Added the storefront GraphQL client.

  The storefront API client can be accessed in two ways

  <details>
    <summary>App Proxy</summary>

  ```ts
  import {json} from '@remix-run/node';
  import {authenticate} from '~/shopify.server';

  export async function loader({request}) {
    const {storefront} = await authenticate.public.appProxy(request);
    const response = await storefront.graphql('{blogs(first: 10) {nodes{id}}}');

    return json(await response.json());
  }
  ```

  </details>

  <details>
    <summary>Unauthenticated Storefront</summary>

  ```ts
  import {json} from '@remix-run/node';
  import {unauthenticated} from '~/shopify.server';
  import {customAuthenticateRequest} from '~/helpers';

  export async function loader({request}) {
    await customAuthenticateRequest(request);

    const {storefront} = await unauthenticated.storefront(
      'my-shop.myshopify.com',
    );
    const response = await storefront.graphql('{blogs(first: 10) {nodes{id}}}');

    return json(await response.json());
  }
  ```

  </details>

### Patch Changes

- 64fe70b: Allow all billing config overrides at request time.

  <details>
    <summary>Override billing configs when calling <code>request</code></summary>

  ```ts
  import {json} from '@remix-run/node';
  import {authenticate} from '~/shopify.server';

  export async function loader({request}) {
    const {billing} = await authenticate.admin(request);

    await billing.require({
      plans: ['plan1', 'plan2'],
      onFailure: async () =>
        await billing.request({
          plan: 'plan1',
          trialDays: 5, // Override the trialDays config value
        }),
    });

    return json(await response.json());
  }
  ```

  </details>

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 1.2.1

### Patch Changes

- bffcee9: Fix type error. Previously `authenticate.appProxy()` was typed as if it could return an object without session and admin properties. This was incorrect. Those properties will always exist, they may just be undefined.

## 1.2.0

### Minor Changes

- 43e7058: Added `authenticate.public.appProxy()` for authenticating [App Proxy](https://shopify.dev/docs/apps/online-store/app-proxies) requests.

  <details>
    <summary>Returning a liquid response</summary>

  ```ts
  // app/routes/**\/.ts
  import {authenticate} from '~/shopify.server';

  export async function loader({request}) {
    const {liquid, admin} = authenticate.public.appProxy(request);

    return liquid('Hello {{shop.name}}');
  }
  ```

  </details>

  <details>
    <summary>Using the Admin GraphQL API</summary>

  ```ts
  // app/routes/**\/.ts
  import {authenticate} from '~/shopify.server';

  export async function loader({request}) {
    const {liquid, admin} = authenticate.public.appProxy(request);

    const response = await admin.graphql('QUERY');
    const json = await response.json();

    return json(json);
  }
  ```

  </details>

- 43e7058: Copied `authenticate.public()` to `authenticate.public.checkout()` and marked `authenticate.public()` as deprecated. `authenticate.public()` will continue to work until v3

### Patch Changes

- 0acfd52: Remove trailing slashes from shop domains when handling login form requests.
- 19696a0: Fixed an issue when running the app behind a reverse proxy that rewrites the `Host` header, where the bounce flow redirect (to ensure the id_token search param is present) relied on the incoming request URL and pointed to the internal host rather than the external one.
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

## 1.1.0

### Minor Changes

- 370fc5e: - Internally rearranged source files to create a better separation between backend and frontend code, so we can add frontend-specific exports.

  - A new export path `@shopify/shopify-app-remix/react` will now contain those frontend exports.
  - The existing server code will be moved to `@shopify/shopify-app-remix/server`, but the root import will still work until the next major release in the future.

- 7bc32b1: Added a way to get an admin context without authenticating.

  **Warning** This should only be used for Requests that do not originate from Shopify.
  You must do your own authentication before using this method.

  <details>
    <summary>See an example</summary>

  ```ts
  // app/shopify.server.ts
  import {shopifyApp} from '@shopify/shopify-app-remix';
  import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

  const shopify = shopifyApp({
    restResources,
    // ...etc
  });

  export default shopify;

  // app/routes/\/.jsx
  import {json} from '@remix-run/node';
  import {authenticateExternalRequest} from '~/helpers/authenticate';
  import shopify from '../../shopify.server';

  export async function loader({request}) {
    const shop = await authenticateExternalRequest(request);
    const {admin, session} = await shopify.unauthenticated.admin(shop);

    return json(await admin.rest.resources.Product.count({session}));
  }
  ```

  </details>

- 191241b: Adding a new `redirect` helper to the `EmbeddedAdminContext` type, which will be able to redirect to the given URL regardless of where an embedded app request is being served.

  You can also use it to redirect to an external page out of the Shopify Admin by using the `target` option.

  <details>
    <summary>See an example</summary>

  ```ts
  export const loader = async ({request}) => {
    const {redirect} = await authenticate.admin(request);

    return redirect('https://www.example.com', {target: '_top'});
  };
  ```

  </details>

- f5f1f83: Adding `AppProvider` component to abstract Shopify-specific app setup on the frontend side.
  This makes it easier for apps to set up the components it needs to work with Shopify.

  <details>
    <summary>See an example</summary>

  To make use of this in the Remix app template, you can update your `app/routes/app.jsx` file's `App` component from

  ```ts
  export default function App() {
    const {apiKey, polarisTranslations} = useLoaderData();

    return (
      <>
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          data-api-key={apiKey}
        />
        <ui-nav-menu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/additional">Additional page</Link>
        </ui-nav-menu>
        <PolarisAppProvider
          i18n={polarisTranslations}
          linkComponent={RemixPolarisLink}
        >
          <Outlet />
        </PolarisAppProvider>
      </>
    );
  }

  /** @type {any} */
  const RemixPolarisLink = React.forwardRef((/** @type {any} */ props, ref) => (
    <Link {...props} to={props.url ?? props.to} ref={ref}>
      {props.children}
    </Link>
  ));
  ```

  to

  ```ts
  import {AppProvider} from '@shopify/shopify-app-remix/react';

  export default function App() {
    const {apiKey} = useLoaderData();

    return (
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <ui-nav-menu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/additional">Additional page</Link>
        </ui-nav-menu>
        <Outlet />
      </AppProvider>
    );
  }
  ```

  </details>

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- 14e8019: Enable `authenticate.public` to handle post-purchase extension requests by supporting extra CORS headers and fixing session token verification.
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.0.4

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- ebce92f: Re-export ApiVersion object from shopify-api
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.0.3

### Patch Changes

- e9cefea: Fixing issue when authenticating requests without a `shop` search param to non-embedded apps.

## 1.0.2

### Patch Changes

- 2d087a4: authenticate.webhook now returns context when there is no session for the corresponding shop instead of throwing a 404 Response

## 1.0.1

### Patch Changes

- 92205c2: Fixing small issue in the README

## 1.0.0

Initial release of the @shopify/shopify-app-remix package 🎉
