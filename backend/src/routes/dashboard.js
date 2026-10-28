import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { isLowStock, toLowStockItem } from '../utils/low-stock.js';

const router = Router();

async function getLowStock(organizationId) {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    select: { defaultLowStockThreshold: true },
  });
  const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;
  const candidates = await prisma.product.findMany({
    where: {
      organizationId,
      OR: [
        { lowStockThreshold: null, quantityOnHand: { lte: defaultThreshold } },
        { lowStockThreshold: { not: null } },
      ],
    },
    select: {
      id: true,
      name: true,
      sku: true,
      quantityOnHand: true,
      lowStockThreshold: true,
    },
    orderBy: { name: 'asc' },
  });
  return candidates.filter((product) => isLowStock(product, defaultThreshold))
    .map((product) => toLowStockItem(product, defaultThreshold));
}

router.get('/summary', asyncHandler(async (req, res) => {
  const [aggregate, lowStock] = await Promise.all([
    prisma.product.aggregate({
      where: { organizationId: req.auth.organizationId },
      _count: { _all: true },
      _sum: { quantityOnHand: true },
    }),
    getLowStock(req.auth.organizationId),
  ]);
  return res.json({
    totalProducts: aggregate._count._all,
    totalQuantity: aggregate._sum.quantityOnHand ?? 0,
    lowStock,
  });
}));

router.get('/low-stock', asyncHandler(async (req, res) => {
  return res.json(await getLowStock(req.auth.organizationId));
}));

export default router;
