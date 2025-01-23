import {BillingError} from '../error';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';

import {
  ActiveSubscriptions,
  BillingSubscriptionParams,
  BillingSubscriptions,
  SubscriptionResponse,
} from './types';
import {convertLineItems} from './utils';

const SUBSCRIPTION_QUERY = `
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
      id
      name
      test
      lineItems {
        id
        plan {
          pricingDetails {
            ... on AppRecurringPricing {
              price {
                amount
                currencyCode
              }
              interval
              discount {
                durationLimitInIntervals
                remainingDurationInIntervals
                priceAfterDiscount {
                  amount
                }
                value {
                  ... on AppSubscriptionDiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                  }
                  ... on AppSubscriptionDiscountPercentage {
                    percentage
                  }
                }
              }
            }
            ... on AppUsagePricing {
              balanceUsed {
                amount
                currencyCode
              }
              cappedAmount {
                amount
                currencyCode
              }
              terms
            }
          }
        }
      }
    }
  }
}
`;

export function subscriptions(config: ConfigInterface): BillingSubscriptions {
  return async function ({
    session,
  }: BillingSubscriptionParams): Promise<ActiveSubscriptions> {
    if (!config.future?.unstable_managedPricingSupport && !config.billing) {
      throw new BillingError({
        message: 'Attempted to look for purchases without billing configs',
        errorData: [],
      });
    }

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    const response =
      await client.request<SubscriptionResponse>(SUBSCRIPTION_QUERY);

    if (!response.data?.currentAppInstallation?.activeSubscriptions) {
      return {activeSubscriptions: []};
    }

    const activeSubscriptions =
      response.data.currentAppInstallation.activeSubscriptions;
    activeSubscriptions.forEach((subscription) => {
      if (subscription.lineItems) {
        subscription.lineItems = convertLineItems(subscription.lineItems);
      }
    });

    return {
      activeSubscriptions,
    };
  };
}
