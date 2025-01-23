import {FutureFlagOptions} from '../../future/flags';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass, GraphqlClient} from '../clients/admin';
import {BillingError} from '../error';

import {
  AppSubscription,
  BillingCheck,
  BillingCheckParams,
  BillingCheckResponse,
  BillingCheckResponseObject,
  CurrentAppInstallation,
  CurrentAppInstallations,
  OneTimePurchase,
} from './types';
import {convertLineItems} from './utils';

interface SubscriptionMeetsCriteriaParams {
  subscription: AppSubscription;
  isTest?: boolean;
  plans?: string | string[];
}

interface PurchaseMeetsCriteriaParams {
  purchase: OneTimePurchase;
  isTest?: boolean;
  plans?: string | string[];
}

interface InternalParams {
  client: GraphqlClient;
  isTest?: boolean;
  plans?: string | string[];
}

export function check<
  Config extends ConfigInterface,
  Future extends FutureFlagOptions = Config['future'],
>(config: Config): BillingCheck<Future> {
  return async function check<Params extends BillingCheckParams<Future>>(
    params: Params,
  ): Promise<BillingCheckResponse<Params, Future>> {
    if (!config.future?.unstable_managedPricingSupport && !config.billing) {
      throw new BillingError({
        message: 'Attempted to look for purchases without billing configs',
        errorData: [],
      });
    }

    const {session, isTest = true, plans} = params;
    const returnObject =
      (params as BillingCheckParams<{unstable_managedPricingSupport: false}>)
        .returnObject ?? false;

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    const payments = await assessPayments({client, isTest, plans});

    if (config.future?.unstable_managedPricingSupport || returnObject) {
      return payments as BillingCheckResponse<Params, Future>;
    } else {
      return payments.hasActivePayment as BillingCheckResponse<Params, Future>;
    }
  };
}

export async function assessPayments({
  client,
  isTest,
  plans,
}: InternalParams): Promise<BillingCheckResponseObject> {
  const returnValue: BillingCheckResponseObject = {
    hasActivePayment: false,
    oneTimePurchases: [],
    appSubscriptions: [],
  };

  let installation: CurrentAppInstallation;
  let endCursor: string | null = null;
  do {
    const currentInstallations = await client.request<CurrentAppInstallations>(
      HAS_PAYMENTS_QUERY,
      {variables: {endCursor}},
    );

    installation = currentInstallations.data?.currentAppInstallation!;
    installation.activeSubscriptions.forEach((subscription) => {
      if (subscriptionMeetsCriteria({subscription, isTest, plans})) {
        returnValue.hasActivePayment = true;
        if (subscription.lineItems) {
          subscription.lineItems = convertLineItems(subscription.lineItems);
        }
        returnValue.appSubscriptions.push(subscription);
      }
    });
    installation.oneTimePurchases.edges.forEach(({node: purchase}) => {
      if (purchaseMeetsCriteria({purchase, isTest, plans})) {
        returnValue.hasActivePayment = true;
        returnValue.oneTimePurchases.push(purchase);
      }
    });

    endCursor = installation.oneTimePurchases.pageInfo.endCursor;
  } while (installation?.oneTimePurchases.pageInfo.hasNextPage);

  return returnValue;
}

function subscriptionMeetsCriteria({
  subscription,
  isTest,
  plans,
}: SubscriptionMeetsCriteriaParams): boolean {
  return (
    (typeof plans === 'undefined' || plans.includes(subscription.name)) &&
    (isTest || !subscription.test)
  );
}

function purchaseMeetsCriteria({
  purchase,
  isTest,
  plans,
}: PurchaseMeetsCriteriaParams): boolean {
  return (
    (typeof plans === 'undefined' || plans.includes(purchase.name)) &&
    (isTest || !purchase.test) &&
    purchase.status === 'ACTIVE'
  );
}

const HAS_PAYMENTS_QUERY = `
  query appSubscription($endCursor: String) {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        test
        status
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
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            id
            name
            test
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
