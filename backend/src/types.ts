export type AppRole = 'DRIVER' | 'WARRANTY_OFFICER' | 'TECHNICAL_INVESTIGATOR' | 'ADMIN';

export interface AuthUser {
  userId: string;
  role: AppRole;
  email: string;
}
