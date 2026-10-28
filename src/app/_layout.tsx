import { Stack } from 'expo-router';
import { useSyncEngine } from '@/presentation/sync/useSyncEngine';

export default function RootLayout() {
  // Sincronización automática reactiva en segundo plano durante toda la jornada
  useSyncEngine();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
