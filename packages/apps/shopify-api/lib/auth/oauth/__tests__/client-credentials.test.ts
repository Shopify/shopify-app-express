import {shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse} from '../../../__tests__/test-helper';
import * as ShopifyErrors from '../../../error';
import {DataType} from '../../../clients/types';

describe('clientCredentials', () => {
  const shop = 'test-shop.myshopify.io';

  describe('with valid parameters', () => {
    test('returns a session on success', async () => {
      const shopify = shopifyApi(testConfig());
      const successResponse = {
        access_token: 'some_access_token',
        scope: 'write_products,read_orders',
        expires_in: 3600,
      };

      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const response = await shopify.auth.clientCredentials({
        shop,
      });

      // Verify the request was made with correct parameters
      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'client_credentials',
        },
      }).toMatchMadeHttpRequest();

      // Verify the response contains expected session data
      expect(response.session).toEqual(
        expect.objectContaining({
          accessToken: successResponse.access_token,
          scope: successResponse.scope,
        }),
      );

      expect(response.session?.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );
    });

    test('throws error when response is not successful', async () => {
      const shopify = shopifyApi(testConfig());
      const errorResponse = {
        error: 'invalid_client',
        error_description: 'Client authentication failed',
      };

      queueMockResponse(JSON.stringify(errorResponse), {
        statusCode: 400,
        statusText: 'Bad request',
      });

      await expect(
        shopify.auth.clientCredentials({
          shop,
        }),
      ).rejects.toThrow(ShopifyErrors.HttpResponseError);
    });
  });

  describe('with invalid parameters', () => {
    test('throws error for invalid shop domain', async () => {
      const shopify = shopifyApi(testConfig());
      const invalidShop = 'invalid-shop-url';

      await expect(
        shopify.auth.clientCredentials({
          shop: invalidShop,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });

    test('throws error for non-myshopify domain', async () => {
      const shopify = shopifyApi(testConfig());
      const invalidShop = 'test-shop.something.com';

      await expect(
        shopify.auth.clientCredentials({
          shop: invalidShop,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });
  });
});
