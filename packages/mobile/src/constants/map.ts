import { ReportCategory } from '@hoohacks26/shared';

export const UVA_CAMPUS = { latitude: 38.0336, longitude: -78.508 };

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  EMERGENCY: '#FF3B30',
  CRIME: '#FF9500',
  INFRASTRUCTURE: '#5AC8FA',
  WEATHER: '#4CD964',
  PROTEST: '#AF52DE',
  OTHER: '#8E8E93',
};

export const UVA_NAVY = '#232D4B';
export const UVA_ORANGE = '#E57200';

export const DEFAULT_RADIUS_METERS = 500;
export const SOCKET_SUBSCRIPTION_RADIUS = 2000;
export const LOCATION_UPDATE_INTERVAL_MS = 5000;
export const RESUBSCRIBE_DISTANCE_THRESHOLD_M = 500;
