import {ConfigInterface} from '../base-types';
import {BillingError, GraphqlQueryError} from '../error';
import {GraphqlClient, graphqlClientClass} from '../clients/admin';

import {
  AppSubscription,
  BillingCreateUsageRecord,
  BillingCreateUsageRecordParams,
  UsageRecord,
  UsageRecordCreateResponse,
  Money,
} from './types';
import {assessPayments} from './check';
import {convertAppRecurringPricingMoney, convertAppUsagePricingMoney} from './utils';
interface InternalParams {
  client: GraphqlClient;
  isTest?: boolean;
}

interface CreateUsageRecordVariables {
  description: string;
  price: Money;
  subscriptionLineItemId: string;
  idempotencyKey?: string;
}

const CREATE_USAGE_RECORD_MUTATION = `
mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
  appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
    userErrors {
      field
      message
    }
    appUsageRecord {
      id
      description
      idempotencyKey
      price {
        amount
        currencyCode
      }
      subscriptionLineItem {
        id
        plan {
          pricingDetails {
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

export function createUsageRecord(
  config: ConfigInterface,
): BillingCreateUsageRecord {
  return async function createUsageRecord(
    usageRecordInfo: BillingCreateUsageRecordParams,
  ): Promise<UsageRecord> {
    const {
      session,
      subscriptionLineItemId,
      description,
      price,
      idempotencyKey,
      isTest = true,
    } = usageRecordInfo;

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    // If a subscription line item ID is not passed, we will query Shopify
    // for an active usage subscription line item ID
    const usageSubscriptionLineItemId = subscriptionLineItemId
      ? subscriptionLineItemId
      : await getUsageRecordSubscriptionLineItemId({client, isTest});

    const variables: CreateUsageRecordVariables = {
      description,
      price,
      subscriptionLineItemId: usageSubscriptionLineItemId,
    };
    if (idempotencyKey) {
      variables.idempotencyKey = idempotencyKey;
    }

    try {
      const response = await client.request<UsageRecordCreateResponse>(
        CREATE_USAGE_RECORD_MUTATION,
        {
          variables,
        },
      );
      if (response.data?.appUsageRecordCreate?.userErrors.length) {
        throw new BillingError({
          message: 'Error while creating a usage record',
          errorData: response.data?.appUsageRecordCreate?.userErrors,
        });
      }

      const appUsageRecord = response.data?.appUsageRecordCreate?.appUsageRecord!;
      convertAppRecurringPricingMoney(appUsageRecord.price);
      convertAppUsagePricingMoney(appUsageRecord.subscriptionLineItem.plan.pricingDetails);

      return appUsageRecord;
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        throw new BillingError({
          message: error.message,
          errorData: error.response?.errors,
        });
      } else {
        throw error;
      }
    }
  };
}

async function getUsageRecordSubscriptionLineItemId({
  client,
  isTest,
}: InternalParams): Promise<string> {
  const payments = await assessPayments({client, isTest});

  if (!payments.hasActivePayment) {
    throw new BillingError({
      message: 'No active payment found',
      errorData: [],
    });
  }
  if (!payments.appSubscriptions.length) {
    throw new BillingError({
      message: 'No active subscriptions found',
      errorData: [],
    });
  }
  if (payments.appSubscriptions) {
    const usageSubscriptionLineItemId = getUsageLineItemId(
      payments.appSubscriptions,
    );
    return usageSubscriptionLineItemId;
  }
  throw new BillingError({
    message: 'Unable to find active subscription line item',
    errorData: [],
  });
}

function getUsageLineItemId(subscriptions: AppSubscription[]): string {
  for (const subscription of subscriptions) {
    // An app can have only one active subscription
    if (subscription.status === 'ACTIVE' && subscription.lineItems) {
      // An app can have only one usage subscription line item
      for (const lineItem of subscription.lineItems) {
        if ('balanceUsed' in lineItem.plan.pricingDetails) {
          return lineItem.id;
        }
      }
    }
  }

  throw new BillingError({
    message: 'No active usage subscription found',
    errorData: [],
  });
}
