export function effectiveThreshold(product, defaultThreshold) {
  return product.lowStockThreshold ?? defaultThreshold;
}

export function isLowStock(product, defaultThreshold) {
  return product.quantityOnHand <= effectiveThreshold(product, defaultThreshold);
}

export function toLowStockItem(product, defaultThreshold) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    quantity: product.quantityOnHand,
    threshold: effectiveThreshold(product, defaultThreshold),
  };
}
