export const Colors = {
  // Backgrounds
  bg:          '#0A0908',
  bgCard:      '#0F0D0C',
  bgP1:        'rgba(140,26,12,0.25)',
  bgP2:        'rgba(220,195,140,0.05)',
  bgP3:        'rgba(240,232,213,0.03)',
  bgCTA:       'rgba(220,195,140,0.10)',
  bgCTASecondary: 'rgba(240,232,213,0.03)',

  // Emergency header
  headerRed:   '#8C1A0C',

  // Typography
  textPrimary:    '#F0E8D5',
  textSecondary:  'rgba(240,232,213,0.55)',
  textTertiary:   'rgba(240,232,213,0.28)',
  textMuted:      'rgba(240,232,213,0.18)',

  // Accent
  gold:        '#DCC38C',
  goldFaint:   'rgba(220,195,140,0.28)',
  goldSubtle:  'rgba(220,195,140,0.10)',

  // Severity
  severityCritical: '#EE4A2F',
  severityWarning:  '#DCC38C',
  severityNotice:   'rgba(240,232,213,0.2)',

  // Borders
  borderDefault:   'rgba(240,232,213,0.07)',
  borderGold:      'rgba(220,195,140,0.15)',
  borderGoldStrong:'rgba(220,195,140,0.35)',
  borderRed:       'rgba(200,60,35,0.35)',
  borderNavTop:    'rgba(220,195,140,0.12)',

  // Nav
  navActive:   'rgba(220,195,140,0.90)',
  navInactive: 'rgba(220,195,140,0.28)',
  navSOS:      '#EE4A2F',
  navBg:       'rgba(8,7,6,0.98)',
} as const;

export const Fonts = {
  cormorantLight:       'CormorantGaramond_300Light',
  cormorantRegular:     'CormorantGaramond_400Regular',
  cormorantBold:        'CormorantGaramond_700Bold',
  cormorantLightItalic: 'CormorantGaramond_300Light_Italic',
  cormorantItalic:      'CormorantGaramond_400Regular_Italic',
  cormorantBoldItalic:  'CormorantGaramond_700Bold_Italic',

  grotesk:       'SchibstedGrotesk_400Regular',
  groteskBold:   'SchibstedGrotesk_700Bold',
  groteskBlack:  'SchibstedGrotesk_900Black',
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
} as const;

export const Radius = {
  none: 0,
  sm:   4,
  md:   8,
} as const;

export type SeverityLevel = 'P1' | 'P2' | 'P3';

export const SeverityConfig: Record<SeverityLevel, {
  borderColor: string;
  borderLeftWidth: number;
  backgroundColor: string;
  labelColor: string;
  label: string;
}> = {
  P1: {
    borderColor:     Colors.borderRed,
    borderLeftWidth: 3,
    backgroundColor: Colors.bgP1,
    labelColor:      Colors.severityCritical,
    label:           'PRIORITY 1',
  },
  P2: {
    borderColor:     Colors.borderGoldStrong,
    borderLeftWidth: 3,
    backgroundColor: Colors.bgP2,
    labelColor:      Colors.severityWarning,
    label:           'PRIORITY 2',
  },
  P3: {
    borderColor:     Colors.borderDefault,
    borderLeftWidth: 2,
    backgroundColor: Colors.bgP3,
    labelColor:      Colors.severityNotice,
    label:           'NOTICE',
  },
};

// Map app severity to design system severity
export function toSeverityLevel(severity: string): SeverityLevel {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'P1';
    case 'MEDIUM':
      return 'P2';
    default:
      return 'P3';
  }
}

export const MonographMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0D0C0A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#DCC38C' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0C0A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C1A16' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#DCC38C' }, { weight: 0.3 }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A2519' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07070A' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: 'rgba(220,195,140,0.2)' }] },
];
