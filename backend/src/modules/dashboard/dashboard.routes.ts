import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, requireAuth, authorize('WARRANTY_OFFICER', 'ADMIN'));

dashboardRouter.get('/executive', async (_req, res) => {
  const [totalClaims, openClaims, closedClaims, rejectedClaims] = await Promise.all([
    prisma.claim.count({ where: { deletedAt: null } }),
    prisma.claim.count({ where: { deletedAt: null, status: { in: ['PENDING', 'UNDER_REVIEW', 'INVESTIGATION_IN_PROGRESS'] } } }),
    prisma.claim.count({ where: { deletedAt: null, status: 'CLOSED' } }),
    prisma.claim.count({ where: { deletedAt: null, status: 'REJECTED' } })
  ]);

  const failuresByPart = await prisma.claim.groupBy({
    by: ['failedPartId'],
    _count: { _all: true }
  });

  const failuresByModel = await prisma.claim.groupBy({
    by: ['vehicleId'],
    _count: { _all: true }
  });

  const monthlyTrends = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
    FROM "Claim"
    WHERE "deletedAt" IS NULL
    GROUP BY 1
    ORDER BY 1
  `;

  res.json({
    totals: {
      totalClaims,
      openClaims,
      closedClaims,
      rejectedClaims
    },
    monthlyTrends: monthlyTrends.map((entry: { month: string; count: bigint }) => ({ month: entry.month, count: Number(entry.count) })),
    failureFrequencyByPart: failuresByPart,
    failureFrequencyByVehicleModel: failuresByModel,
    warrantyCostAnalysis: {
      estimatedTotalCost: totalClaims * 350,
      averageCostPerClaim: totalClaims > 0 ? 350 : 0
    }
  });
});
