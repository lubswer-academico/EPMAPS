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
import { Ionicons } from '@expo/vector-icons';
import { useSessionController } from '@/presentation/session/useSessionController';
import { EPMAPS_COLORS, EPMAPS_RADII, EPMAPS_SPACING, EPMAPS_TOUCH } from '@/constants/theme';

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
          {/* Cabecera Hero Institucional */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <View style={styles.logoCircle}>
                <Ionicons name="water" size={32} color={EPMAPS_COLORS.primary} />
              </View>
            </View>
            <Text style={styles.title}>EPMAPS</Text>
            <Text style={styles.agencyBadge}>AGUA DE QUITO</Text>
            <Text style={styles.subtitle}>Toma de Lecturas en Campo</Text>
          </View>

          {/* Formulario de Entrada */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>CÓDIGO DE EMPLEADO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. TEC-001"
              placeholderTextColor={EPMAPS_COLORS.textSubtle}
              value={employeeCode}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Campo de código de empleado"
            />

            <Text style={styles.label}>CLAVE DE ACCESO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su clave"
              placeholderTextColor={EPMAPS_COLORS.textSubtle}
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
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Iniciar Turno"
            >
              {isSubmitting ? (
                <ActivityIndicator color={EPMAPS_COLORS.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Iniciar Turno</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Guía Informativa Offline */}
          <View style={styles.catalogHint}>
            <View style={styles.hintHeader}>
              <Ionicons
                name="information-circle"
                size={18}
                color={EPMAPS_COLORS.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.hintTitle}>TÉCNICOS DISPONIBLES EN TURNO (OFFLINE)</Text>
            </View>
            <View style={styles.hintDivider} />
            <Text style={styles.hintItem}>• TEC-001 / Clave: 1234 (Carlos Mendoza)</Text>
            <Text style={styles.hintItem}>• TEC-002 / Clave: 5678 (Ana Morales)</Text>
            <Text style={styles.hintItem}>• TEC-003 / Clave: 9012 (Jorge Benítez)</Text>
            <Text style={styles.hintFooter}>Catastro interno verificado para trabajo en campo</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: EPMAPS_COLORS.bgLight,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: EPMAPS_SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.hero,
  },
  logoBadge: {
    marginBottom: EPMAPS_SPACING.md,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderWidth: 2,
    borderColor: EPMAPS_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 1.5,
  },
  agencyBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: EPMAPS_COLORS.accentDark,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: EPMAPS_COLORS.textMuted,
    marginTop: 6,
  },
  formContainer: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.xl,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 0.5,
    marginBottom: EPMAPS_SPACING.xs,
    marginTop: EPMAPS_SPACING.md,
  },
  input: {
    minHeight: EPMAPS_TOUCH.minHeight,
    borderWidth: 1.2,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.md,
    paddingHorizontal: EPMAPS_SPACING.md,
    fontSize: 15,
    color: EPMAPS_COLORS.textDark,
    backgroundColor: '#F8FAFC',
  },
  errorBox: {
    marginTop: EPMAPS_SPACING.lg,
    padding: EPMAPS_SPACING.md,
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderRadius: EPMAPS_RADII.md,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.dangerBorder,
  },
  errorText: {
    color: EPMAPS_COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.primary,
    borderRadius: EPMAPS_RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EPMAPS_SPACING.xxl,
    paddingHorizontal: EPMAPS_SPACING.lg,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  catalogHint: {
    marginTop: EPMAPS_SPACING.xxl,
    padding: EPMAPS_SPACING.lg,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderRadius: EPMAPS_RADII.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.xs,
  },
  infoIconBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: EPMAPS_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoIconText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 0.4,
  },
  hintDivider: {
    height: 1,
    backgroundColor: '#BAE6FD',
    marginVertical: EPMAPS_SPACING.xs,
  },
  hintItem: {
    fontSize: 12,
    fontWeight: '500',
    color: EPMAPS_COLORS.textDark,
    marginTop: 4,
  },
  hintFooter: {
    fontSize: 11,
    fontWeight: '600',
    color: EPMAPS_COLORS.accentDark,
    marginTop: 8,
  },
});

