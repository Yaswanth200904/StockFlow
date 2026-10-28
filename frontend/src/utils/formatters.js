const currency = import.meta.env.VITE_CURRENCY || 'INR';

export function formatMoney(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function productPayload(values) {
  const optionalNumber = (value) => value === '' || value === null || value === undefined ? null : Number(value);
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim() || null,
    quantity: Number(values.quantity),
    costPrice: optionalNumber(values.costPrice),
    sellingPrice: optionalNumber(values.sellingPrice),
    lowStockThreshold: optionalNumber(values.lowStockThreshold),
  };
}
