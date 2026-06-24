export type ClaimStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'INVESTIGATION_IN_PROGRESS'
  | 'INVESTIGATION_COMPLETED'
  | 'CLOSED';

export interface ClaimListItem {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  vehicleRegistration: string;
  vin: string;
  partNumber: string;
}
