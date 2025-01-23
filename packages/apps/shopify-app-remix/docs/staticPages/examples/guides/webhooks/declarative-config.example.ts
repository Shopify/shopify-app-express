[webhooks]
api_version = "2025-04"

  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "/webhooks"
  compliance_topics = [ "customers/data_request", "customers/redact", "shop/redact" ]

  [[webhooks.subscriptions]]
  topics = [ "products/update" ]
  uri = "https://example.org/endpoint"

    [[webhooks.subscriptions.metafields]]
    namespace = "custom"
    key = "ingredients"

    [[webhooks.subscriptions.metafields]]
    namespace = "$app:product_highlight"
    key = "title"
