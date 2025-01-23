import {BillingError, GraphqlQueryError} from '../error';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';

import {
  BillingUpdateUsageCappedAmount,
  BillingUpdateUsageCappedAmountParams,
  BillingUpdateUsageCappedAmountResponse,
  UpdateCappedAmountConfirmation,
} from './types';
import {convertLineItems} from './utils';

const UPDATE_USAGE_CAPPED_AMOUNT_MUTATION = `
mutation appSubscriptionLineItemUpdate($cappedAmount: MoneyInput!, $id: ID!) {
  appSubscriptionLineItemUpdate(cappedAmount: $cappedAmount, id: $id) {
    userErrors {
      field
      message
    }
    confirmationUrl
    appSubscription {
      id
      name
      test
      lineItems {
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

export function updateUsageCappedAmount(
  config: ConfigInterface,
): BillingUpdateUsageCappedAmount {
  return async function updateUsageCappedAmount(
    params: BillingUpdateUsageCappedAmountParams,
  ): Promise<UpdateCappedAmountConfirmation> {
    if (!config.billing) {
      throw new BillingError({
        message: 'Attempted to update line item without billing configs',
        errorData: [],
      });
    }

    const {
      session,
      subscriptionLineItemId,
      cappedAmount: {amount, currencyCode},
    } = params;

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    try {
      const response =
        await client.request<BillingUpdateUsageCappedAmountResponse>(
          UPDATE_USAGE_CAPPED_AMOUNT_MUTATION,
          {
            variables: {
              id: subscriptionLineItemId,
              cappedAmount: {
                amount,
                currencyCode,
              },
            },
          },
        );

      if (response.data?.appSubscriptionLineItemUpdate?.userErrors.length) {
        throw new BillingError({
          message: 'Error while updating usage subscription capped amount',
          errorData: response.data?.appSubscriptionLineItemUpdate?.userErrors,
        });
      }

      const appSubscription =
        response.data?.appSubscriptionLineItemUpdate?.appSubscription!;
      if (appSubscription && appSubscription.lineItems) {
        appSubscription.lineItems = convertLineItems(appSubscription.lineItems);
      }

      return {
        confirmationUrl:
          response.data?.appSubscriptionLineItemUpdate?.confirmationUrl!,
        appSubscription,
      };
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        throw new BillingError({
          message: error.message,
          errorData: error.response?.errors,
        });
      }

      throw error;
    }
  };
}
