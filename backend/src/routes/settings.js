import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: req.auth.organizationId },
    select: { defaultLowStockThreshold: true },
  });
  return res.json({ defaultLowStockThreshold: settings?.defaultLowStockThreshold ?? 5 });
}));

router.put('/', validate(updateSettingsSchema), asyncHandler(async (req, res) => {
  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId: req.auth.organizationId },
    create: {
      organizationId: req.auth.organizationId,
      defaultLowStockThreshold: req.body.defaultLowStockThreshold,
    },
    update: { defaultLowStockThreshold: req.body.defaultLowStockThreshold },
    select: { defaultLowStockThreshold: true },
  });
  return res.json(settings);
}));

export default router;
