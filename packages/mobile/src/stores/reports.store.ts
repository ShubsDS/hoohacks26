import { create } from 'zustand';

export interface Report {
  id: string;
  reporterId: string;
  reporter?: { displayName: string; credibilityScore: number };
  category: string;
  severity: string;
  title: string;
  description?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  credibilityWeight: number;
  confirmationCount: number;
  status: string;
  adminVerified: boolean;
  adminNote?: string;
  expiresAt: string;
  createdAt: string;
}

interface ReportsState {
  reports: Report[];
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  updateReport: (report: Report) => void;
  removeReport: (reportId: string) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],

  setReports: (reports) => set({ reports }),

  addReport: (report) =>
    set((state) => ({
      reports: [report, ...state.reports.filter((r) => r.id !== report.id)],
    })),

  updateReport: (report) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === report.id ? report : r)),
    })),

  removeReport: (reportId) =>
    set((state) => ({
      reports: state.reports.filter((r) => r.id !== reportId),
    })),
}));
