import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { useSyncEngine } from '@/presentation/sync/useSyncEngine';

export default function RootLayout() {
  // Sincronización automática reactiva en segundo plano durante toda la jornada
  useSyncEngine();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
