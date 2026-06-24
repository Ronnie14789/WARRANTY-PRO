import { Router } from 'express';
import { claimsRouter } from '../modules/claims/claims.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { reportsRouter } from '../modules/reports/reports.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';

export const apiRouter = Router();

apiRouter.use('/v1', usersRouter);
apiRouter.use('/v1/claims', claimsRouter);
apiRouter.use('/v1/dashboard', dashboardRouter);
apiRouter.use('/v1/reports', reportsRouter);
