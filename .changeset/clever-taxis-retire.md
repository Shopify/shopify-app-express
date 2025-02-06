---
'@shopify/shopify-api': patch
---

[deprecation] Removes conditional check for `adminApiAccessToken` in REST client, deprecates `apiSecretKey` in favor of `adminApiAccessToken`
[bugfix] Makes GQL client behavior on custom app config consistent with REST client
[chore] Removes the warning about `adminApiAccessToken` and `apiSecretKey` being the same
