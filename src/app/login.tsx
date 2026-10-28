import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionController } from '@/presentation/session/useSessionController';

export default function LoginScreen() {
  const router = useRouter();
  const { login, errorMessage, clearError } = useSessionController();

  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const success = await login(employeeCode, pin);
      if (success) {
        router.replace('/home');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (text: string) => {
    if (errorMessage) clearError();
    setEmployeeCode(text);
  };

  const handlePinChange = (text: string) => {
    if (errorMessage) clearError();
    setPin(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>EPMAPS</Text>
            <Text style={styles.subtitle}>Toma de Lecturas en Campo</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Código de empleado</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. TEC-001"
              value={employeeCode}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Campo de código de empleado"
            />

            <Text style={styles.label}>Clave de acceso</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su clave"
              value={pin}
              onChangeText={handlePinChange}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Campo de clave de acceso"
            />

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Iniciar Turno"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Turno</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.catalogHint}>
            <Text style={styles.hintTitle}>Técnicos de prueba (offline):</Text>
            <Text style={styles.hintItem}>• TEC-001 / Clave: 1234 (Carlos Mendoza)</Text>
            <Text style={styles.hintItem}>• TEC-002 / Clave: 5678 (Ana Morales)</Text>
            <Text style={styles.hintItem}>• TEC-003 / Clave: 9012 (Jorge Benítez)</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginTop: 6,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    minHeight: 48,
    backgroundColor: '#0D47A1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    backgroundColor: '#90CAF9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  catalogHint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1565C0',
    marginBottom: 4,
  },
  hintItem: {
    fontSize: 12,
    color: '#0D47A1',
    marginTop: 2,
  },
});
