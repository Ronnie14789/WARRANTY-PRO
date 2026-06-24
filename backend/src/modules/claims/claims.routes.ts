import { Router } from 'express';
import { authenticate, requireAuth, type AuthenticatedRequest } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import {
  claimCreateSchema,
  correctiveActionSchema,
  investigationSchema,
  statusUpdateSchema
} from './claim.schema.js';
import {
  addCorrectiveAction,
  createClaim,
  getClaimById,
  listClaims,
  recordInvestigation,
  updateClaimStatus
} from './claims.service.js';

export const claimsRouter = Router();
const asString = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

claimsRouter.use(authenticate);

claimsRouter.post('/', requireAuth, authorize('DRIVER', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  const payload = claimCreateSchema.parse(req.body);
  const claim = await createClaim(req.user!.userId, payload);
  res.status(201).json(claim);
});

claimsRouter.get('/', requireAuth, async (req, res) => {
  const claims = await listClaims({
    claimNumber: req.query.claimNumber as string | undefined,
    registrationNumber: req.query.registrationNumber as string | undefined,
    vin: req.query.vin as string | undefined,
    modelId: req.query.modelId as string | undefined,
    partNumber: req.query.partNumber as string | undefined,
    status: req.query.status as never,
    assignedInvestigatorId: req.query.investigator as string | undefined,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
  });

  res.json(claims);
});

claimsRouter.get('/:id', requireAuth, async (req, res) => {
  const claimId = asString(req.params.id);
  const claim = claimId ? await getClaimById(claimId) : null;

  if (!claim) {
    res.status(404).json({ message: 'Claim not found' });
    return;
  }

  res.json(claim);
});

claimsRouter.patch('/:id/status', requireAuth, authorize('WARRANTY_OFFICER', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  const payload = statusUpdateSchema.parse(req.body);
  const claimId = asString(req.params.id);
  if (!claimId) {
    res.status(400).json({ message: 'Claim id is required' });
    return;
  }
  const updated = await updateClaimStatus(claimId, req.user!.userId, payload.status, payload.assignedInvestigatorId);
  res.json(updated);
});

claimsRouter.post('/:id/investigations', requireAuth, authorize('TECHNICAL_INVESTIGATOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  const payload = investigationSchema.parse(req.body);
  const claimId = asString(req.params.id);
  if (!claimId) {
    res.status(400).json({ message: 'Claim id is required' });
    return;
  }
  const recorded = await recordInvestigation(claimId, req.user!.userId, payload);
  res.status(201).json(recorded);
});

claimsRouter.post('/:id/corrective-actions', requireAuth, authorize('TECHNICAL_INVESTIGATOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  const payload = correctiveActionSchema.parse(req.body);
  const claimId = asString(req.params.id);
  if (!claimId) {
    res.status(400).json({ message: 'Claim id is required' });
    return;
  }
  const action = await addCorrectiveAction(claimId, req.user!.userId, payload);
  res.status(201).json(action);
});
