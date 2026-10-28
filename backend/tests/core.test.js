import test from 'node:test';
import assert from 'node:assert/strict';
import { isLowStock, effectiveThreshold, toLowStockItem } from '../src/utils/low-stock.js';
import { signupSchema, loginSchema } from '../src/validators/auth.js';
import { adjustStockSchema, createProductSchema, updateProductSchema } from '../src/validators/product.js';
import { updateSettingsSchema } from '../src/validators/settings.js';

test('low stock uses the product threshold before the organization default', () => {
  assert.equal(isLowStock({ quantityOnHand: 4, lowStockThreshold: null }, 5), true);
  assert.equal(isLowStock({ quantityOnHand: 5, lowStockThreshold: 5 }, 2), true);
  assert.equal(isLowStock({ quantityOnHand: 3, lowStockThreshold: 2 }, 9), false);
  assert.equal(effectiveThreshold({ lowStockThreshold: null }, 7), 7);
  assert.deepEqual(
    toLowStockItem({ id: 'p1', name: 'Tea', sku: 'TEA', quantityOnHand: 2, lowStockThreshold: null }, 5),
    { id: 'p1', name: 'Tea', sku: 'TEA', quantity: 2, threshold: 5 },
  );
});

test('auth validators normalize email and reject invalid input', () => {
  assert.equal(signupSchema.parse({
    email: ' Owner@Example.COM ',
    password: 'a-secure-password',
    organizationName: ' Store ',
  }).email, 'owner@example.com');
  assert.equal(loginSchema.safeParse({ email: 'bad', password: 'password' }).success, false);
  assert.equal(signupSchema.safeParse({
    email: 'owner@example.com',
    password: 'short',
    organizationName: 'Store',
  }).success, false);
});

test('product validators reject negative values and empty updates', () => {
  assert.equal(createProductSchema.safeParse({ name: 'Item', sku: 'SKU-1', quantity: -1 }).success, false);
  assert.equal(createProductSchema.safeParse({ name: '', sku: 'SKU-1' }).success, false);
  assert.equal(createProductSchema.safeParse({ name: 'Item', sku: 'SKU-1', costPrice: 1.234 }).success, false);
  assert.equal(createProductSchema.safeParse({ name: 'Item', sku: 'SKU-1', costPrice: 1.15 }).success, true);
  assert.equal(createProductSchema.safeParse({ name: 'Item', sku: 'SKU-1', organizationId: 'other-org' }).success, false);
  assert.equal(updateProductSchema.safeParse({}).success, false);
  assert.equal(updateProductSchema.safeParse({ quantity: 0 }).success, true);
});

test('stock adjustment validator accepts signed whole units and bounded notes', () => {
  assert.equal(adjustStockSchema.safeParse({ adjustment: 3 }).success, true);
  assert.equal(adjustStockSchema.safeParse({ adjustment: -2, note: 'Count correction' }).success, true);
  assert.equal(adjustStockSchema.safeParse({ adjustment: 0 }).success, false);
  assert.equal(adjustStockSchema.safeParse({ adjustment: 1.5 }).success, false);
  assert.equal(adjustStockSchema.safeParse({ adjustment: 1, note: 'x'.repeat(501) }).success, false);
});

test('settings threshold must be a non-negative integer', () => {
  assert.equal(updateSettingsSchema.safeParse({ defaultLowStockThreshold: 0 }).success, true);
  assert.equal(updateSettingsSchema.safeParse({ defaultLowStockThreshold: -1 }).success, false);
  assert.equal(updateSettingsSchema.safeParse({ defaultLowStockThreshold: 1.5 }).success, false);
});
