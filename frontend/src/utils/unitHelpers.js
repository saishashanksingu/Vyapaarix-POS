// Unit helper functions for commercial pricing

export const getPriceUnitLabel = (unit) => {
  const unitLabels = {
    piece: 'per piece',
    kg: 'per kg',
    liter: 'per liter',
    gram: 'per gram',
    ml: 'per ml',
    meter: 'per meter',
    box: 'per box',
    pack: 'per pack'
  };
  return unitLabels[unit] || 'per piece';
};

export const getUnitSymbol = (unit) => {
  const symbols = {
    piece: 'pc',
    kg: 'kg',
    liter: 'L',
    gram: 'g',
    ml: 'ml',
    meter: 'm',
    box: 'box',
    pack: 'pack'
  };
  return symbols[unit] || 'pc';
};

export const getIncrementValue = (unit) => {
  // For weight/liquid items, increment by 0.1; for pieces/boxes, increment by 1
  if (['kg', 'gram', 'liter', 'ml', 'meter'].includes(unit)) {
    return 0.1;
  }
  return 1;
};

export const formatQuantityDisplay = (quantity, unit) => {
  const symbol = getUnitSymbol(unit);
  if (['kg', 'gram', 'liter', 'ml', 'meter'].includes(unit)) {
    return `${parseFloat(quantity).toFixed(2)} ${symbol}`;
  }
  return `${quantity} ${symbol}`;
};

export const formatPriceDisplay = (price, unit) => {
  return `₹${parseFloat(price).toFixed(2)}/${getUnitSymbol(unit)}`;
};
