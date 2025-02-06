# shopify.auth.clientCredentials

Begins the OAuth process by exchanging the [app's client ID and client secret](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets) for an [access token](https://shopify.dev/docs/apps/auth/access-token-types/online.md) to make authenticated Shopify API requests.

Learn more:

- [Client Credentials Grant](../../guides/oauth.md#client-credentials-grant)

## Examples

### Node.js

```ts
app.get('/auth', async (req, res) => {
  const shop = shopify.utils.sanitizeShop(req.query.shop, true);

  await shopify.auth.clientCredentials({
    shop
  });
});
```

## Parameters

### shop

`string` | :exclamation: required

A Shopify domain name in the form `{exampleshop}.myshopify.com`.

## Return

`Promise<Session>`

The new Shopify [Session object](../../../lib/session/session.ts), containing the API access token.

[Back to shopify.auth](README.md)
