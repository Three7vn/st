const {
  calculateQuantityFromDates,
  calculateQuantityFromHours,
  calculateTotalFromLineItems,
  calculateShippingFee,
  hasCommissionPercentage,
} = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

/**
 * Get quantity and add extra line-items that are related to delivery method
 *
 * @param {Object} orderData should contain stockReservationQuantity and deliveryMethod
 * @param {*} publicData should contain shipping prices
 * @param {*} currency should point to the currency of listing's price.
 */
const getItemQuantityAndLineItems = (orderData, publicData, currency) => {
  // Check delivery method and shipping prices
  const quantity = orderData ? orderData.stockReservationQuantity : null;
  const deliveryMethod = orderData && orderData.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';
  const { shippingPriceInSubunitsOneItem, shippingPriceInSubunitsAdditionalItems } =
    publicData || {};

  // Calculate shipping fee if applicable
  const shippingFee = isShipping
    ? calculateShippingFee(
      shippingPriceInSubunitsOneItem,
      shippingPriceInSubunitsAdditionalItems,
      currency,
      quantity
    )
    : null;

  // Add line-item for given delivery method.
  // Note: by default, pickup considered as free.
  const deliveryLineItem = !!shippingFee
    ? [
      {
        code: 'line-item/shipping-fee',
        unitPrice: shippingFee,
        quantity: 1,
        includeFor: ['customer', 'provider'],
      },
    ]
    : isPickup
      ? [
        {
          code: 'line-item/pickup-fee',
          unitPrice: new Money(0, currency),
          quantity: 1,
          includeFor: ['customer', 'provider'],
        },
      ]
      : [];

  return { quantity, extraLineItems: deliveryLineItem };
};

/**
 * Get quantity for arbitrary units for time-based bookings.
 *
 * @param {*} orderData should contain quantity
 */
const getHourQuantityAndLineItems = orderData => {
  const { bookingStart, bookingEnd } = orderData || {};
  const quantity =
    bookingStart && bookingEnd ? calculateQuantityFromHours(bookingStart, bookingEnd) : null;

  return { quantity, extraLineItems: [] };
};

/**
 * Calculate quantity based on days or nights between given bookingDates.
 *
 * @param {*} orderData should contain bookingDates
 * @param {*} code should be either 'line-item/day' or 'line-item/night'
 */
const getDateRangeQuantityAndLineItems = (orderData, code) => {
  // bookingStart & bookingend are used with day-based bookings (how many days / nights)
  const { bookingStart, bookingEnd } = orderData || {};
  const quantity =
    bookingStart && bookingEnd ? calculateQuantityFromDates(bookingStart, bookingEnd, code) : null;

  return { quantity, extraLineItems: [] };
};

/**
 * Returns collection of lineItems (max 50)
 *
 * All the line-items dedicated to _customer_ define the "payin total".
 * Similarly, the sum of all the line-items included for _provider_ create "payout total".
 * Platform gets the commission, which is the difference between payin and payout totals.
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} orderData
 * @param {Object} providerCommission
 * @param {Object} customerCommission
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, orderData, providerCommission, customerCommission) => {
  console.log('orderData :>> ', orderData);
  const commissionMap = {
    'business-enterprise': { percentage: 5 },
    'Free-Plan': { percentage: 10 },
    'member-plan': { percentage: 8 },
  };

  const sellingVoucherValue = orderData?.sellingVoucherValue;
console.log('sellingVoucherValue :>> ', sellingVoucherValue);

// Set provider commission based on the planName
const providerCommissionPlan = commissionMap[orderData?.planName] || providerCommission;

// Calculate the final commission
let finalProviderCommission = providerCommissionPlan;

// Check if sellingVoucherValue is present and adjust the commission
if (sellingVoucherValue) {
  // Assuming sellingVoucherValue is a percentage and provided as a number (e.g., 10 for 10%)
  finalProviderCommission = providerCommissionPlan * (1 - sellingVoucherValue / 100);
}

  const offerPrice = orderData?.offerPrice || null;
  const discount = orderData?.discount || null;
  const voucherValue = orderData?.voucherValue;
  
  const voucherValueType = orderData?.voucherValueType;
  const publicData = listing.attributes.publicData;
  const unitPrice =
    typeof offerPrice === 'number' ? new Money(offerPrice * 100, 'GBP') : listing.attributes.price;
  const currency = unitPrice.currency;
  const { cartItems, isVerify } = orderData || {};
  const unitType = publicData.unitType;
  const code = `line-item/${unitType}`;
  const quantityAndExtraLineItems =
    unitType === 'item'
      ? getItemQuantityAndLineItems(orderData, publicData, currency)
      : unitType === 'hour'
        ? getHourQuantityAndLineItems(orderData)
        : ['day', 'night'].includes(unitType)
          ? getDateRangeQuantityAndLineItems(orderData, code)
          : {};

  const { quantity = 1, extraLineItems } = quantityAndExtraLineItems;
  const { selectedRate } = orderData || {};
  // Calculate total price from cartItems
  const totalPrice =
    cartItems?.length > 0 && cartItems.reduce((accumulator, obj) => accumulator + obj.price, 0);

  const isDiscountVaild =
    discount?.cashOffOrder >= unitPrice?.amount / 100 ||
    unitPrice?.amount / 100 === ((unitPrice?.amount / 100) * discount?.percent) / 100;

  if (cartItems?.length) {
    const order = {
      code,
      unitPrice: new Money(totalPrice * 100, currency),
      quantity: 1,
      includeFor: ['customer', 'provider'],
    };

    const getNegation = percentage => -1 * percentage;
    const isPercent = discount?.percent;
    const discountOffer = discount
      ? [
        {
          code: 'line-item/discount',
          unitPrice: isPercent
            ? calculateTotalFromLineItems([order])
            : new Money(
              discount?.cashOffOrder > unitPrice?.amount / 100
                ? -unitPrice?.amount
                : -discount?.cashOffOrder * 100,
              'GBP'
            ),
          includeFor:
            discount?.cashOffOrder < unitPrice?.amount / 100
              ? ['customer', 'provider']
              : ['customer', 'provider'],
          ...(isPercent ? { percentage: getNegation(discount?.percent) } : { quantity: 1 }),
        },
      ]
      : [];
    const voucherType = voucherValueType || '';
    const voucherOffer =
      voucherType && voucherValue
        ? [
          {
            code: 'line-item/voucher',
            unitPrice:
              voucherType === 'percent'
                ? calculateTotalFromLineItems([order])
                : new Money(
                  voucherValue > unitPrice?.amount / 100
                    ? -unitPrice?.amount
                    : -voucherValue * 100,
                  'GBP'
                ),
            includeFor:
              voucherValue < unitPrice?.amount / 100 ? ['customer'] : ['customer', 'provider'],
            ...(voucherType === 'percent'
              ? { percentage: getNegation(voucherValue) }
              : { quantity: 1 }),
          },
        ]
        : [];

    const providerCommissionMaybe =
      hasCommissionPercentage(providerCommissionPlan) && !isDiscountVaild
        ? [
          {
            code: 'line-item/provider-commission',
            unitPrice: calculateTotalFromLineItems([order]),
            percentage: getNegation(discount),
            includeFor: ['provider'],
          },
        ]
        : [];

    const customerCommissionMaybe = hasCommissionPercentage(customerCommission)
      ? [
        {
          code: 'line-item/customer-commission',
          unitPrice: calculateTotalFromLineItems([order]),
          percentage: customerCommission.percentage,
          includeFor: ['customer'],
        },
      ]
      : [];
    const shippingFee = selectedRate
      ? [
        {
          code: `line-item/shipping-fee`,
          unitPrice: new Money(selectedRate?.amount * 100, 'GBP'),
          quantity: 1,
          includeFor: ['customer'],
        },
      ]
      : [];

    const verificationFee = isVerify
      ? [
        {
          code: `line-item/stoado-VerifyPlus`,
          unitPrice: calculateTotalFromLineItems([order]),
          percentage: 7.5,
          includeFor: ['customer'],
        },
      ]
      : [];

    const lineItems = [
      order,
      ...shippingFee,
      ...extraLineItems,
      ...providerCommissionMaybe,
      ...customerCommissionMaybe,
      ...discountOffer,
      ...voucherOffer,
      ...verificationFee
    ];

    return lineItems;
  } else {
    const order = {
      code,
      unitPrice,
      quantity: 1,
      includeFor: ['customer', 'provider'],
    };

    const getNegation = percentage => -1 * percentage;
    const isPercent = discount?.percent;
    const discountOffer = discount
      ? [
        {
          code: 'line-item/discount',
          unitPrice: isPercent
            ? calculateTotalFromLineItems([order])
            : new Money(
              discount?.cashOffOrder > unitPrice?.amount / 100
                ? -unitPrice?.amount
                : -discount?.cashOffOrder * 100,
              'GBP'
            ),
          includeFor:
            discount?.cashOffOrder < unitPrice?.amount / 100
              ? ['customer', 'provider']
              : ['customer', 'provider'],
          ...(isPercent ? { percentage: getNegation(discount?.percent) } : { quantity: 1 }),
        },
      ]
      : [];

    const voucherType = voucherValueType || '';


    const voucherOffer =
      voucherType && voucherValue
        ? [
            {
              code: 'line-item/voucher',
              unitPrice:
                voucherType === 'percent'
                  ? calculateTotalFromLineItems([order])
                  : new Money(voucherValue * 100, 'GBP'),
              includeFor: ['customer', 'provider'],
              ...(voucherType === 'percent'
                ? { percentage: getNegation(voucherValue) }
                : { quantity: -1 }),
            },
          ]
        : [];



    const providerCommissionMaybe =
      hasCommissionPercentage(providerCommissionPlan) && !isDiscountVaild
        ? [
          {
            code: 'line-item/provider-commission',
            unitPrice: calculateTotalFromLineItems([order]),
            percentage: getNegation(providerCommissionPlan.percentage),
            includeFor: ['provider'],
          },
        ]
        : [];

    const customerCommissionMaybe = hasCommissionPercentage(customerCommission)
      ? [
        {
          code: 'line-item/customer-commission',
          unitPrice: calculateTotalFromLineItems([order]),
          percentage: customerCommission.percentage,
          includeFor: ['customer'],
        },
      ]
      : [];

    const shippingFee = selectedRate
      ? [
        {
          code: `line-item/shipping-fee`,
          unitPrice: new Money(selectedRate?.amount * 100, 'GBP'),
          quantity: 1,
          includeFor: ['customer'],
        },
      ]
      : [];

    const verificationFee = isVerify
      ? [
        {
          code: `line-item/stoado-VerifyPlus`,
          unitPrice: calculateTotalFromLineItems([order]),
          percentage: 7.5,
          includeFor: ['customer'],
        },
      ]
      : [];

    const lineItems = [
      order,
      ...extraLineItems,
      ...providerCommissionMaybe,
      // ...customerCommissionMaybe,
      ...shippingFee,
      ...discountOffer,
      ...voucherOffer,
      ...verificationFee
    ];

    return lineItems;
  }
};
