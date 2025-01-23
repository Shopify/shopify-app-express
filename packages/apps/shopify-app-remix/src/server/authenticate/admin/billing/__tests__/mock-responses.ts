import {Money} from '@shopify/shopify-api';

export const PLAN_1 = 'Shopify app plan 1';
export const PLAN_2 = 'Shopify app plan 2';
export const ALL_PLANS = [PLAN_1, PLAN_2];

export const CONFIRMATION_URL = 'totally-real-url';

export const APP_SUBSCRIPTION = {
  id: 'gid://123',
  name: PLAN_1,
  test: true,
};

export const EMPTY_SUBSCRIPTIONS = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: {hasNextPage: false, endCursor: null},
      },
      activeSubscriptions: [],
      userErrors: [],
    },
  },
});

export const EXISTING_SUBSCRIPTION = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: {hasNextPage: false, endCursor: null},
      },
      activeSubscriptions: [{id: 'gid://123', name: PLAN_1, test: true}],
    },
  },
});

export const MULTIPLE_SUBSCRIPTIONS = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: {hasNextPage: false, endCursor: null},
      },
      activeSubscriptions: [
        {id: 'gid://123', name: PLAN_1, test: true},
        {id: 'gid://321', name: PLAN_2, test: true},
      ],
    },
  },
});

export const PURCHASE_SUBSCRIPTION_RESPONSE = JSON.stringify({
  data: {
    appSubscriptionCreate: {
      appSubscription: APP_SUBSCRIPTION,
      confirmationUrl: CONFIRMATION_URL,
      userErrors: [],
    },
  },
});

export const PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS = JSON.stringify({
  data: {
    appSubscriptionCreate: {
      appSubscription: APP_SUBSCRIPTION,
      confirmationUrl: CONFIRMATION_URL,
      userErrors: ['Oops, something went wrong'],
    },
  },
});

export const CANCEL_RESPONSE = JSON.stringify({
  data: {
    appSubscriptionCancel: {
      appSubscription: APP_SUBSCRIPTION,
      userErrors: [],
    },
  },
});

export const SUBSCRIPTIONS_WITH_USAGE_PLANS_RESPONSE = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
      activeSubscriptions: [
        {
          id: 'gid://123',
          test: true,
          status: 'ACTIVE',
          name: 'Basic Usage Plan',
          lineItems: [
            {
              id: 'gid://456',
              plan: {
                pricingDetails: {
                  balanceUsed: {
                    amount: 0,
                    currencyCode: 'USD',
                  },
                  cappedAmount: {
                    amount: '5.00',
                    currencyCode: 'USD',
                  },
                  terms: '1 dollar per usage',
                },
              },
            },
          ],
        },
      ],
      hasActivePayment: true,
    },
  },
});

export const USAGE_RECORD_DESCRIPTION = 'Usage record description';
export const USAGE_RECORD_PRICE = {
  amount: 1.0,
  currencyCode: 'USD',
} as Money;
export const USAGE_RECORD_SUBSCRIPTION_ID = 'gid://456';

export const USAGE_RECORD_CREATE_RESPONSE = JSON.stringify({
  data: {
    appUsageRecordCreate: {
      appUsageRecord: {
        id: 'gid://123',
        description: USAGE_RECORD_DESCRIPTION,
        price: USAGE_RECORD_PRICE,
        subscriptionLineItem: {
          id: USAGE_RECORD_SUBSCRIPTION_ID,
          plan: {
            pricingDetails: {
              balanceUsed: USAGE_RECORD_PRICE,
              cappedAmount: {
                amount: '5.00',
                currencyCode: 'USD',
              },
              terms: '1 dollar per usage',
            },
          },
        },
      },
      userErrors: [],
    },
  },
});

export const USAGE_RECORD = {
  description: 'Usage record description',
  id: 'gid://123',
  price: {amount: 1, currencyCode: 'USD'},
  subscriptionLineItem: {
    id: 'gid://456',
    plan: {
      pricingDetails: {
        balanceUsed: {amount: 1, currencyCode: 'USD'},
        cappedAmount: {amount: 5, currencyCode: 'USD'},
        terms: '1 dollar per usage',
      },
    },
  },
};

export const UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID = 'gid://123';
export const APP_SUBSCRIPTION_LINE_ITEM_UPDATE_PAYLOAD = {
  userErrors: [],
  confirmationUrl: CONFIRMATION_URL,
  appSubscription: {
    id: UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
    name: PLAN_1,
    test: true,
    status: 'ACTIVE',
  },
};

export const UPDATE_CAPPED_AMOUNT_CONFIRMATION_RESPONSE = {
  ...APP_SUBSCRIPTION_LINE_ITEM_UPDATE_PAYLOAD,
  userErrors: undefined,
};

export const USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE = JSON.stringify({
  data: {
    appSubscriptionLineItemUpdate: APP_SUBSCRIPTION_LINE_ITEM_UPDATE_PAYLOAD,
  },
});

export const USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE_WITH_USER_ERRORS =
  JSON.stringify({
    data: {
      appSubscriptionLineItemUpdate: {
        ...APP_SUBSCRIPTION_LINE_ITEM_UPDATE_PAYLOAD,
        userErrors: ['Oops, something went wrong'],
      },
    },
  });
