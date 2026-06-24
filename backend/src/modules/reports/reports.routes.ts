import { Router } from 'express';
import { authenticate, requireAuth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { generateCirPdf } from './cir.service.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate, requireAuth, authorize('WARRANTY_OFFICER', 'ADMIN'));

reportsRouter.get('/claims/:id/cir.pdf', async (req, res) => {
  const pdf = await generateCirPdf(req.params.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${req.params.id}-cir.pdf`);
  res.send(pdf);
});
