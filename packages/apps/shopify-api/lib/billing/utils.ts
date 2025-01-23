import {ActiveSubscriptionLineItem} from './types';

/**
 * Converts string amounts to numbers in Money type objects
 */
export function convertMoneyAmount(data: any) {
  if (!data) return data;

  convertAppUsagePricingMoney(data);
  convertAppRecurringPricingMoney(data);
  convertAppDiscountMoney(data);

  return data;
}

export function convertAppRecurringPricingMoney(data: any): void {
  if (!data) return;

  if (data.price?.amount && typeof data.price.amount === 'string') {
    data.price.amount = parseFloat(data.price.amount);
  }
}

export function convertAppDiscountMoney(data: any): void {
  if (!data) return;

  if (
    data.discount?.priceAfterDiscount?.amount &&
    typeof data.discount.priceAfterDiscount.amount === 'string'
  ) {
    data.discount.priceAfterDiscount.amount = parseFloat(
      data.discount.priceAfterDiscount.amount,
    );
  }

  if (
    data.discount?.value?.amount?.amount &&
    typeof data.discount.value.amount.amount === 'string'
  ) {
    data.discount.value.amount.amount = parseFloat(
      data.discount.value.amount.amount,
    );
  }
}

export function convertAppUsagePricingMoney(data: any): void {
  if (!data) return;

  if (data.balanceUsed?.amount && typeof data.balanceUsed.amount === 'string') {
    data.balanceUsed.amount = parseFloat(data.balanceUsed.amount);
  }

  if (
    data.cappedAmount?.amount &&
    typeof data.cappedAmount.amount === 'string'
  ) {
    data.cappedAmount.amount = parseFloat(data.cappedAmount.amount);
  }
}

/**
 * Converts Money amounts in line items
 */
export function convertLineItems(lineItems: ActiveSubscriptionLineItem[]) {
  return lineItems.map((item) => {
    if (item.plan?.pricingDetails) {
      item.plan.pricingDetails = convertMoneyAmount(item.plan.pricingDetails);
    }
    return item;
  });
}
