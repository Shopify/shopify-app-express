---
'@shopify/shopify-api': minor
---

Update missing Shopify header in webhook

https://shopify.dev/docs/apps/build/webhooks#key-terminology
```ts

enum ShopifyHeader {
  ...,
  TriggeredAt = 'X-Shopify-Triggered-At', // added
  EventId = 'X-Shopify-Event-Id', // added
}
```
