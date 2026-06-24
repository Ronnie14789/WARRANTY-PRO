import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { AppRole } from '../types.js';

export const authorize = (...roles: AppRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};
