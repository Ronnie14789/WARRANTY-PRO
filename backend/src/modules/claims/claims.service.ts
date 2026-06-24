import { ClaimStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { createClaimNumber } from '../../utils/claim-number.js';
import { ClaimCreateInput, CorrectiveActionInput, InvestigationInput } from './claim.schema.js';

const logAudit = async (userId: string, action: string, newValue: unknown, claimId?: string, previousValue?: unknown) => {
  await prisma.auditLog.create({
    data: {
      userId,
      claimId,
      action,
      previousValue: previousValue as Prisma.InputJsonValue | undefined,
      newValue: newValue as Prisma.InputJsonValue
    }
  });
};

const createNotification = async (userId: string, subject: string, message: string, claimId?: string) => {
  await prisma.notification.create({
    data: {
      userId,
      claimId,
      subject,
      message,
      emailSent: false
    }
  });
};

export const createClaim = async (createdById: string, payload: ClaimCreateInput) => {
  const count = await prisma.claim.count();
  const claimNumber = createClaimNumber(count + 1);
  const vehicle = await prisma.vehicle.create({ data: payload.vehicle });

  const created = await prisma.claim.create({
    data: {
      claimNumber,
      createdById,
      vehicleId: vehicle.id,
      failedPartId: payload.failure.failedPartId,
      failureDate: payload.failure.failureDate,
      failureLocation: payload.failure.failureLocation,
      breakdownLocation: payload.failure.breakdownLocation,
      symptoms: payload.failure.symptoms,
      incidentDescription: payload.failure.incidentDescription
    },
    include: {
      vehicle: true,
      failedPart: true
    }
  });

  await logAudit(createdById, 'CLAIM_CREATED', created, created.id);
  await createNotification(createdById, 'Claim submitted', `Claim ${created.claimNumber} has been submitted`, created.id);

  return created;
};

export const updateClaimStatus = async (claimId: string, userId: string, status: ClaimStatus, assignedInvestigatorId?: string) => {
  const previous = await prisma.claim.findUniqueOrThrow({ where: { id: claimId } });

  const updated = await prisma.claim.update({
    where: { id: claimId },
    data: {
      status,
      assignedInvestigatorId: assignedInvestigatorId ?? previous.assignedInvestigatorId
    }
  });

  await logAudit(
    userId,
    'CLAIM_STATUS_UPDATED',
    { status: updated.status, assignedInvestigatorId: updated.assignedInvestigatorId },
    claimId,
    { status: previous.status, assignedInvestigatorId: previous.assignedInvestigatorId }
  );

  const subject = status === 'ADDITIONAL_INFORMATION_REQUIRED'
    ? 'Additional information requested'
    : status === 'APPROVED'
      ? 'Claim approved'
      : status === 'REJECTED'
        ? 'Claim rejected'
        : 'Claim updated';

  await createNotification(previous.createdById, subject, `Claim ${previous.claimNumber} status changed to ${status}`, claimId);

  if (assignedInvestigatorId) {
    await createNotification(assignedInvestigatorId, 'Investigation assigned', `Claim ${previous.claimNumber} was assigned to you`, claimId);
  }

  return updated;
};

export const recordInvestigation = async (claimId: string, inspectorId: string, payload: InvestigationInput) => {
  const investigation = await prisma.investigation.create({
    data: {
      claimId,
      inspectorId,
      inspectionDate: payload.inspectionDate,
      inspectionLocation: payload.inspectionLocation,
      rootCauseCategory: payload.rootCauseCategory,
      rootCauseExplanation: payload.rootCauseExplanation,
      conclusion: payload.conclusion,
      findings: {
        create: payload.findings
      }
    },
    include: {
      findings: true
    }
  });

  await prisma.claim.update({
    where: { id: claimId },
    data: { status: 'INVESTIGATION_COMPLETED' }
  });

  await logAudit(inspectorId, 'INVESTIGATION_RECORDED', investigation, claimId);
  return investigation;
};

export const addCorrectiveAction = async (claimId: string, userId: string, payload: CorrectiveActionInput) => {
  const action = await prisma.correctiveAction.create({
    data: {
      claimId,
      ...payload
    }
  });

  await logAudit(userId, 'CORRECTIVE_ACTION_RECORDED', action, claimId);
  return action;
};

export const listClaims = async (filters: {
  claimNumber?: string;
  registrationNumber?: string;
  vin?: string;
  modelId?: string;
  partNumber?: string;
  status?: ClaimStatus;
  assignedInvestigatorId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  return prisma.claim.findMany({
    where: {
      deletedAt: null,
      claimNumber: filters.claimNumber ? { contains: filters.claimNumber, mode: 'insensitive' } : undefined,
      status: filters.status,
      assignedInvestigatorId: filters.assignedInvestigatorId,
      failureDate: filters.startDate || filters.endDate ? { gte: filters.startDate, lte: filters.endDate } : undefined,
      vehicle: {
        registrationNumber: filters.registrationNumber ? { contains: filters.registrationNumber, mode: 'insensitive' } : undefined,
        vin: filters.vin ? { contains: filters.vin, mode: 'insensitive' } : undefined,
        modelId: filters.modelId
      },
      failedPart: {
        partNumber: filters.partNumber ? { contains: filters.partNumber, mode: 'insensitive' } : undefined
      }
    },
    include: {
      vehicle: { include: { model: { include: { brand: true } } } },
      failedPart: true,
      assignedInvestigator: { select: { id: true, fullName: true, email: true } }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getClaimById = async (id: string) => {
  return prisma.claim.findUnique({
    where: { id },
    include: {
      vehicle: { include: { model: { include: { brand: true } } } },
      failedPart: true,
      investigations: { include: { findings: true, inspector: { select: { fullName: true } } } },
      correctiveActions: true,
      attachments: true
    }
  });
};
