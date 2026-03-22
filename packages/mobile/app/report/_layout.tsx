import { Stack } from 'expo-router';
import { UVA_NAVY } from '../../src/lib/constants';

export default function ReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: UVA_NAVY },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}
