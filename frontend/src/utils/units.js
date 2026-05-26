export const UNIT_OPTIONS = [
  { value: "piece", label: "Piece", shortLabel: "pc", category: "count", step: 1 },
  { value: "kg", label: "Kilogram", shortLabel: "kg", category: "weight", step: 0.1 },
  { value: "gram", label: "Gram", shortLabel: "g", category: "weight", step: 1 },
  { value: "liter", label: "Liter", shortLabel: "L", category: "volume", step: 0.1 },
  { value: "ml", label: "Milliliter", shortLabel: "ml", category: "volume", step: 1 },
  { value: "meter", label: "Meter", shortLabel: "m", category: "length", step: 0.1 },
  { value: "box", label: "Box", shortLabel: "box", category: "count", step: 1 },
  { value: "pack", label: "Pack", shortLabel: "pack", category: "count", step: 1 },
];

export const UNIT_BY_VALUE = UNIT_OPTIONS.reduce((acc, unit) => {
  acc[unit.value] = unit;
  return acc;
}, {});

export const getUnitMeta = (unit = "piece") => UNIT_BY_VALUE[unit] || UNIT_BY_VALUE.piece;

export const isCountUnit = (unit) => getUnitMeta(unit).category === "count";

export const getQuantityStep = (unit) => getUnitMeta(unit).step;

export const getDefaultQuantity = (unit) => {
  const meta = getUnitMeta(unit);
  if (meta.value === "gram" || meta.value === "ml") return 100;
  return 1;
};

export const formatQuantity = (quantity, unit = "piece") => {
  const value = Number(quantity || 0);
  const formatted = isCountUnit(unit)
    ? String(Math.round(value))
    : value.toLocaleString("en-IN", {
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 3,
      });

  return `${formatted} ${getUnitMeta(unit).shortLabel}`;
};

export const formatRate = (price, unit = "piece") =>
  `Rs.${Number(price || 0).toFixed(2)} / ${getUnitMeta(unit).shortLabel}`;

export const normalizeQuantityInput = (value, unit = "piece") => {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return isCountUnit(unit) ? Math.floor(quantity) : Number(quantity.toFixed(3));
};
