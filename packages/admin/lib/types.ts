export type ReportCategory = 'EMERGENCY' | 'CRIME' | 'INFRASTRUCTURE' | 'WEATHER' | 'PROTEST' | 'OTHER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'ACTIVE' | 'ADMIN_VERIFIED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporterId: string;
  reporter?: { displayName: string; credibilityScore: number };
  category: ReportCategory;
  severity: Severity;
  title: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  credibilityWeight: number;
  confirmationCount: number;
  status: ReportStatus;
  adminVerified: boolean;
  adminNote?: string;
  expiresAt: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  credibilityScore: number;
  totalReports: number;
  confirmedReports: number;
  isAdmin: boolean;
  createdAt: string;
}
