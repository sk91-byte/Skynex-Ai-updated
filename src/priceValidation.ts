export type DiscountType = 'percentage' | 'fixed_amount';
export type DisplayPolicy = 'exact' | 'whole_rupee';

export type DiscountValidationCode =
  | 'valid'
  | 'invalid_money'
  | 'invalid_percentage'
  | 'percentage_over_100'
  | 'fixed_discount_exceeds_original'
  | 'missing_original_price'
  | 'missing_discount';

export interface DiscountCalculationResult {
  valid: boolean;
  code: DiscountValidationCode;
  discountType: DiscountType;
  originalPrice: string;
  discountValue: string;
  discountAmountExact: string | null;
  finalPriceExact: string | null;
  finalPriceDisplay: string | null;
  displayPolicy: DisplayPolicy;
  message: string;
}

function parseMoneyToMinorUnits(value: string | number): number | null {
  const raw = String(value ?? '').trim().replace(/,/g, '');
  if (!raw || !/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.');
  const minor = Number(`${whole}${fraction.padEnd(2, '0')}`);
  return Number.isSafeInteger(minor) ? minor : null;
}

function parsePercentageToBasisPoints(value: string | number): number | null {
  const raw = String(value ?? '').trim().replace(/%/g, '');
  if (!raw || !/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.');
  const basisPoints = Number(`${whole}${fraction.padEnd(2, '0')}`);
  return Number.isSafeInteger(basisPoints) ? basisPoints : null;
}

function roundedDivision(numerator: number, denominator: number): number {
  return Math.floor((numerator + denominator / 2) / denominator);
}

function formatMinorUnits(minorUnits: number): string {
  return `${Math.floor(minorUnits / 100)}.${String(minorUnits % 100).padStart(2, '0')}`;
}

function invalidResult(
  code: DiscountValidationCode,
  discountType: DiscountType,
  originalPrice: string,
  discountValue: string,
  displayPolicy: DisplayPolicy,
  message: string
): DiscountCalculationResult {
  return {
    valid: false,
    code,
    discountType,
    originalPrice,
    discountValue,
    discountAmountExact: null,
    finalPriceExact: null,
    finalPriceDisplay: null,
    displayPolicy,
    message
  };
}

export function calculatePercentageDiscount(
  originalPriceInput: string | number,
  discountPercentageInput: string | number,
  displayPolicy: DisplayPolicy = 'exact'
): DiscountCalculationResult {
  const originalPrice = String(originalPriceInput ?? '').trim();
  const discountValue = String(discountPercentageInput ?? '').trim();
  const originalMinor = parseMoneyToMinorUnits(originalPrice);
  if (originalMinor === null) {
    return invalidResult('invalid_money', 'percentage', originalPrice, discountValue, displayPolicy, 'Original price must be a non-negative monetary value.');
  }
  if (!discountValue) {
    return invalidResult('missing_discount', 'percentage', originalPrice, discountValue, displayPolicy, 'Discount percentage is required.');
  }
  const percentageBasisPoints = parsePercentageToBasisPoints(discountValue);
  if (percentageBasisPoints === null) {
    return invalidResult('invalid_percentage', 'percentage', originalPrice, discountValue, displayPolicy, 'Discount percentage is invalid.');
  }
  if (percentageBasisPoints > 10000) {
    return invalidResult('percentage_over_100', 'percentage', originalPrice, discountValue, displayPolicy, 'A percentage discount cannot exceed 100%.');
  }

  const discountMinor = roundedDivision(originalMinor * percentageBasisPoints, 10000);
  const finalMinor = originalMinor - discountMinor;
  const finalPriceExact = formatMinorUnits(finalMinor);
  const finalPriceDisplay = displayPolicy === 'whole_rupee'
    ? String(Math.round(finalMinor / 100))
    : finalPriceExact;

  return {
    valid: true,
    code: 'valid',
    discountType: 'percentage',
    originalPrice,
    discountValue,
    discountAmountExact: formatMinorUnits(discountMinor),
    finalPriceExact,
    finalPriceDisplay,
    displayPolicy,
    message: `${discountValue}% discount on ${originalPrice} produces ${finalPriceExact}.`
  };
}

export function calculateFixedDiscount(
  originalPriceInput: string | number,
  fixedDiscountInput: string | number,
  displayPolicy: DisplayPolicy = 'exact'
): DiscountCalculationResult {
  const originalPrice = String(originalPriceInput ?? '').trim();
  const discountValue = String(fixedDiscountInput ?? '').trim();
  const originalMinor = parseMoneyToMinorUnits(originalPrice);
  const discountMinor = parseMoneyToMinorUnits(discountValue);
  if (originalMinor === null) {
    return invalidResult('invalid_money', 'fixed_amount', originalPrice, discountValue, displayPolicy, 'Original price must be a non-negative monetary value.');
  }
  if (discountMinor === null) {
    return invalidResult('invalid_money', 'fixed_amount', originalPrice, discountValue, displayPolicy, 'Fixed discount must be a non-negative monetary value.');
  }
  if (discountMinor > originalMinor) {
    return invalidResult('fixed_discount_exceeds_original', 'fixed_amount', originalPrice, discountValue, displayPolicy, 'Fixed discount cannot exceed the original price.');
  }

  const finalMinor = originalMinor - discountMinor;
  const finalPriceExact = formatMinorUnits(finalMinor);
  const finalPriceDisplay = displayPolicy === 'whole_rupee'
    ? String(Math.round(finalMinor / 100))
    : finalPriceExact;

  return {
    valid: true,
    code: 'valid',
    discountType: 'fixed_amount',
    originalPrice,
    discountValue,
    discountAmountExact: formatMinorUnits(discountMinor),
    finalPriceExact,
    finalPriceDisplay,
    displayPolicy,
    message: `Fixed discount of ${discountValue} on ${originalPrice} produces ${finalPriceExact}.`
  };
}
