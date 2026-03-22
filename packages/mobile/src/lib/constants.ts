export const UVA_NAVY = '#232D4B';
export const UVA_ORANGE = '#E57200';

export const CATEGORY_COLORS: Record<string, string> = {
  EMERGENCY: '#FF3B30',
  CRIME: '#FF9500',
  INFRASTRUCTURE: '#5AC8FA',
  WEATHER: '#4CD964',
  PROTEST: '#AF52DE',
  OTHER: '#8E8E93',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#4CD964',
  MEDIUM: '#FF9500',
  HIGH: '#FF6B35',
  CRITICAL: '#FF3B30',
};

export const EXPIRY_HOURS: Record<string, number> = {
  EMERGENCY: 6,
  CRIME: 24,
  INFRASTRUCTURE: 48,
  WEATHER: 24,
  PROTEST: 12,
  OTHER: 48,
};

export const CATEGORIES = [
  'EMERGENCY',
  'CRIME',
  'INFRASTRUCTURE',
  'WEATHER',
  'PROTEST',
  'OTHER',
] as const;

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const UVA_REGION = {
  latitude: 38.0336,
  longitude: -78.508,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
