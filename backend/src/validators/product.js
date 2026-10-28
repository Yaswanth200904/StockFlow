import { z } from 'zod';

const quantity = z.number().int().min(0).max(2147483647);
const price = z.number().finite().min(0).max(9999999999.99)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, 'Price can have at most 2 decimal places');
const nullablePrice = price.nullable();
const nullableThreshold = z.number().int().min(0).max(2147483647).nullable();
const name = z.string().trim().min(1).max(160);
const sku = z.string().trim().min(1).max(80);
const description = z.string().max(5000).nullable();

export const createProductSchema = z.object({
  name,
  sku,
  description: description.optional(),
  quantity: quantity.default(0),
  costPrice: nullablePrice.optional(),
  sellingPrice: nullablePrice.optional(),
  lowStockThreshold: nullableThreshold.optional(),
}).strict();

export const updateProductSchema = z.object({
  name: name.optional(),
  sku: sku.optional(),
  description: description.optional(),
  quantity: quantity.optional(),
  costPrice: nullablePrice.optional(),
  sellingPrice: nullablePrice.optional(),
  lowStockThreshold: nullableThreshold.optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one product field to update',
);

export const adjustStockSchema = z.object({
  adjustment: z.number().int().min(-2147483647).max(2147483647)
    .refine((value) => value !== 0, 'Adjustment must not be zero'),
  note: z.string().trim().max(500).optional(),
}).strict();

export const listProductsSchema = z.object({
  search: z.string().trim().max(120).optional(),
}).strict();
