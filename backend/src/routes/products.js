import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../utils/http-error.js';
import { adjustStockSchema, createProductSchema, listProductsSchema, updateProductSchema } from '../validators/product.js';
import { z } from 'zod';

const router = Router();
const idSchema = z.object({ id: z.string().uuid() });

function productData(input) {
  const { quantity, ...fields } = input;
  const data = { ...fields };
  if (quantity !== undefined) data.quantityOnHand = quantity;
  return data;
}

function serialize(product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    quantity: product.quantityOnHand,
    costPrice: product.costPrice === null ? null : Number(product.costPrice),
    sellingPrice: product.sellingPrice === null ? null : Number(product.sellingPrice),
    lowStockThreshold: product.lowStockThreshold,
    lastStockAdjustmentNote: product.lastStockAdjustmentNote,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function handleDuplicateSku(error) {
  if (error?.code === 'P2002') throw new HttpError(409, 'A product with this SKU already exists');
  throw error;
}

router.get('/', validate(listProductsSchema, 'query'), asyncHandler(async (req, res) => {
  const search = req.validated.query.search;
  const products = await prisma.product.findMany({
    where: {
      organizationId: req.auth.organizationId,
      ...(search ? {
        OR: [{ name: { contains: search } }, { sku: { contains: search } }],
      } : {}),
    },
    orderBy: { name: 'asc' },
  });
  return res.json(products.map(serialize));
}));

router.post('/', validate(createProductSchema), asyncHandler(async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        ...productData(req.body),
        organizationId: req.auth.organizationId,
        lastUpdatedBy: req.auth.userId,
      },
    });
    return res.status(201).json(serialize(product));
  } catch (error) {
    handleDuplicateSku(error);
  }
}));

router.put('/:id/adjust-stock', validate(idSchema, 'params'), validate(adjustStockSchema), asyncHandler(async (req, res) => {
  const { adjustment, note } = req.body;
  const where = { id: req.params.id, organizationId: req.auth.organizationId };
  const existing = await prisma.product.findFirst({ where, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Product not found');

  const result = await prisma.product.updateMany({
    where: {
      ...where,
      quantityOnHand: adjustment > 0
        ? { lte: 2147483647 - adjustment }
        : { gte: -adjustment },
    },
    data: {
      quantityOnHand: { increment: adjustment },
      lastUpdatedBy: req.auth.userId,
      lastStockAdjustmentNote: note || null,
    },
  });
  if (result.count === 0) {
    throw new HttpError(409, 'Adjustment would put the quantity outside the allowed range');
  }

  const product = await prisma.product.findFirst({ where });
  return res.json(serialize(product));
}));

router.get('/:id', validate(idSchema, 'params'), asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, organizationId: req.auth.organizationId },
  });
  if (!product) throw new HttpError(404, 'Product not found');
  return res.json(serialize(product));
}));

router.put('/:id', validate(idSchema, 'params'), validate(updateProductSchema), asyncHandler(async (req, res) => {
  try {
    const result = await prisma.product.updateMany({
      where: { id: req.params.id, organizationId: req.auth.organizationId },
      data: { ...productData(req.body), lastUpdatedBy: req.auth.userId },
    });
    if (result.count === 0) throw new HttpError(404, 'Product not found');
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.auth.organizationId },
    });
    return res.json(serialize(product));
  } catch (error) {
    handleDuplicateSku(error);
  }
}));

router.delete('/:id', validate(idSchema, 'params'), asyncHandler(async (req, res) => {
  const result = await prisma.product.deleteMany({
    where: { id: req.params.id, organizationId: req.auth.organizationId },
  });
  if (result.count === 0) throw new HttpError(404, 'Product not found');
  return res.status(204).end();
}));

export default router;
