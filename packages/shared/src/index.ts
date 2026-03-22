export type ReportCategory = 'EMERGENCY' | 'CRIME' | 'INFRASTRUCTURE' | 'WEATHER' | 'PROTEST' | 'OTHER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'ACTIVE' | 'ADMIN_VERIFIED' | 'RESOLVED' | 'DISMISSED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  credibilityScore: number;
  isAdmin: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter?: Pick<User, 'displayName' | 'credibilityScore'>;
  category: ReportCategory;
  severity: Severity;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  credibilityWeight: number;
  confirmationCount: number;
  status: ReportStatus;
  adminVerified: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface SocketEvents {
  // Client → Server
  'location:update': { lat: number; lng: number };
  'report:subscribe': { lat: number; lng: number; radius: number };
  // Server → Client
  'report:new': Report;
  'report:updated': Report;
  'report:resolved': { reportId: string };
  'admin:broadcast': { message: string; severity: Severity };
}
