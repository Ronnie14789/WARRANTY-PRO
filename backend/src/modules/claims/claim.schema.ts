import { z } from 'zod';

export const claimCreateSchema = z.object({
  vehicle: z.object({
    registrationNumber: z.string().min(1),
    vin: z.string().min(6),
    chassisNumber: z.string().min(1),
    engineNumber: z.string().min(1),
    modelId: z.string().min(1),
    mileage: z.coerce.number().int().nonnegative(),
    fleetOwner: z.string().min(1),
    driverName: z.string().min(1),
    driverContact: z.string().min(1)
  }),
  failure: z.object({
    failedPartId: z.string().min(1),
    failureDate: z.coerce.date(),
    failureLocation: z.string().min(1),
    breakdownLocation: z.string().min(1),
    symptoms: z.string().min(1),
    incidentDescription: z.string().min(1)
  })
});

export const statusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'ADDITIONAL_INFORMATION_REQUIRED',
    'APPROVED',
    'REJECTED',
    'INVESTIGATION_IN_PROGRESS',
    'INVESTIGATION_COMPLETED',
    'CLOSED'
  ]),
  assignedInvestigatorId: z.string().optional()
});

export const investigationSchema = z.object({
  inspectionDate: z.coerce.date(),
  inspectionLocation: z.string().min(1),
  rootCauseCategory: z.enum([
    'MANUFACTURING_DEFECT',
    'MATERIAL_FAILURE',
    'INSTALLATION_ERROR',
    'MAINTENANCE_ISSUE',
    'OPERATIONAL_MISUSE',
    'UNKNOWN'
  ]),
  rootCauseExplanation: z.string().min(10),
  conclusion: z.string().min(5),
  findings: z.object({
    visualInspectionNotes: z.string().min(1),
    measurements: z.string().min(1),
    wearPatternAnalysis: z.string().min(1),
    damageDescription: z.string().min(1)
  })
});

export const correctiveActionSchema = z.object({
  recommendedAction: z.string().min(1),
  repairMethod: z.string().min(1),
  replacementRecommendation: z.string().min(1),
  preventiveMeasures: z.string().min(1)
});

export type ClaimCreateInput = z.infer<typeof claimCreateSchema>;
export type InvestigationInput = z.infer<typeof investigationSchema>;
export type CorrectiveActionInput = z.infer<typeof correctiveActionSchema>;
