import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { useSessionController } from '@/presentation/session/useSessionController';

export default function HomeScreen() {
  const router = useRouter();
  const { technician, logout } = useSessionController();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.welcomeLabel}>Bienvenido al turno</Text>
          <Text style={styles.technicianName}>
            {technician?.name ?? 'Técnico de Campo'}
          </Text>
          <Text style={styles.technicianCode}>
            Código: {technician?.employeeCode ?? '---'}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar Turno"
          >
            <Text style={styles.logoutButtonText}>Cerrar Turno</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  technicianName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginTop: 6,
  },
  technicianCode: {
    fontSize: 15,
    color: '#0D47A1',
    fontWeight: '600',
    marginTop: 4,
  },
  actionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButton: {
    minHeight: 48,
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
