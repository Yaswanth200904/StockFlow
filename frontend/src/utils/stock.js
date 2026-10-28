export function effectiveThreshold(product, defaultThreshold) {
  return product.lowStockThreshold ?? defaultThreshold;
}

export function isLowStock(product, defaultThreshold) {
  return product.quantity <= effectiveThreshold(product, defaultThreshold);
}
