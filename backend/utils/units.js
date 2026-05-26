const COUNT_UNITS = new Set(["piece", "box", "pack"]);

const UNIT_LABELS = {
  piece: "pc",
  kg: "kg",
  gram: "g",
  liter: "L",
  ml: "ml",
  meter: "m",
  box: "box",
  pack: "pack",
};

const VALID_UNITS = Object.keys(UNIT_LABELS);

const isCountUnit = (unit) => COUNT_UNITS.has(unit || "piece");

const normalizeQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return NaN;
  return Number(quantity.toFixed(3));
};

const validateQuantityForUnit = (quantity, unit) => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "Quantity must be greater than zero";
  }

  if (isCountUnit(unit) && !Number.isInteger(quantity)) {
    return `${UNIT_LABELS[unit] || unit} products must be sold in whole quantities`;
  }

  return null;
};

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

module.exports = {
  UNIT_LABELS,
  VALID_UNITS,
  isCountUnit,
  normalizeQuantity,
  validateQuantityForUnit,
  roundMoney,
};
