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
import {
  EPMAPS_COLORS,
  EPMAPS_RADII,
  EPMAPS_SPACING,
  EPMAPS_TOUCH,
  EPMAPS_TYPOGRAPHY,
} from '@/constants/theme';

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

  const DEMO_TECHNICIANS = [
    { code: 'TEC-001', pin: '1234', name: 'Carlos Mendoza' },
    { code: 'TEC-002', pin: '5678', name: 'Ana Morales' },
    { code: 'TEC-003', pin: '9012', name: 'Jorge Benítez' },
  ];

  const handleSelectDemoTech = (code: string, demoPin: string) => {
    if (errorMessage) clearError();
    setEmployeeCode(code);
    setPin(demoPin);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fondo Ambiental Sutil Superior (Ondas de Agua No Intrusivas) */}
      <View style={styles.ambientTopBackground} pointerEvents="none">
        <View style={styles.ambientCircleLarge} />
        <View style={styles.ambientCircleMedium} />
        <View style={styles.ambientWaterIconWrap}>
          <Ionicons
            name="water-outline"
            size={150}
            color={EPMAPS_COLORS.bgBlueBorder}
            style={styles.ambientWaterWatermark}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera Institucional */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <View style={styles.logoCircle}>
                <Ionicons name="water" size={28} color={EPMAPS_COLORS.primary} />
              </View>
            </View>
            <Text style={styles.title}>EPMAPS</Text>
            <View style={styles.agencyPill}>
              <Text style={styles.agencyBadge}>AGUA DE QUITO</Text>
            </View>
            <Text style={styles.subtitle}>Sistema de Toma de Lecturas en Campo</Text>
          </View>

          {/* Tarjeta Principal de Acceso */}
          <View style={styles.formContainer}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>Credenciales de Turno</Text>
              <Text style={styles.formSubtitle}>
                Ingrese su código asignado para habilitar la ruta
              </Text>
            </View>

            <Text style={styles.label}>Código de empleado</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="id-card-outline"
                size={18}
                color={EPMAPS_COLORS.textMuted}
                style={styles.inputIcon}
              />
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
            </View>

            <Text style={styles.label}>Clave de acceso</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={EPMAPS_COLORS.textMuted}
                style={styles.inputIcon}
              />
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
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={EPMAPS_COLORS.danger}
                  style={{ marginRight: 6 }}
                />
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
                <View style={styles.buttonInnerRow}>
                  <Text style={styles.buttonText}>Iniciar Turno</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={EPMAPS_COLORS.textInverse}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Tarjeta Limpia de Cuentas Disponibles (Sin fondo celeste) */}
          <View style={styles.catalogCard}>
            <View style={styles.hintHeader}>
              <Ionicons
                name="people-outline"
                size={16}
                color={EPMAPS_COLORS.primaryDark}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.hintTitle}>Cuentas habilitadas en turno</Text>
            </View>

            <View style={styles.hintDivider} />

            {DEMO_TECHNICIANS.map((tech, index) => (
              <TouchableOpacity
                key={tech.code}
                style={[
                  styles.techRow,
                  index < DEMO_TECHNICIANS.length - 1 && styles.techRowBorder,
                ]}
                onPress={() => handleSelectDemoTech(tech.code, tech.pin)}
                activeOpacity={0.75}
              >
                <View style={styles.techRowLeft}>
                  <Text style={styles.techRowName}>{tech.name}</Text>
                  <Text style={styles.techRowCode}>{tech.code}</Text>
                </View>
                <View style={styles.techPinInline}>
                  <Text style={styles.techPinLabel}>Clave:</Text>
                  <Text style={styles.techPinValue}>{tech.pin}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.hintFooter}>
              Personal autorizado para registro de lecturas en campo
            </Text>
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
  ambientTopBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 265,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: EPMAPS_COLORS.bgBlueBorder,
    overflow: 'hidden',
  },
  ambientCircleLarge: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: EPMAPS_COLORS.bgBlueBorder,
    opacity: 0.65,
  },
  ambientCircleMedium: {
    position: 'absolute',
    top: -40,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.bgBlueBorder,
    opacity: 0.55,
  },
  ambientWaterIconWrap: {
    position: 'absolute',
    bottom: -24,
    left: -20,
    opacity: 0.4,
  },
  ambientWaterWatermark: {
    transform: [{ rotate: '-12deg' }],
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: EPMAPS_SPACING.xl,
    paddingTop: EPMAPS_SPACING.xl,
    paddingBottom: EPMAPS_SPACING.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.xl,
  },
  logoBadge: {
    marginBottom: EPMAPS_SPACING.sm,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: EPMAPS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: EPMAPS_COLORS.bgBlueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 1.5,
  },
  agencyPill: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: EPMAPS_RADII.full,
    backgroundColor: EPMAPS_COLORS.surface,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.bgBlueBorder,
  },
  agencyBadge: {
    fontSize: 11,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primary,
    letterSpacing: 1.3,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    color: EPMAPS_COLORS.primaryDark,
    marginTop: 8,
    opacity: 0.85,
  },
  formContainer: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.xl,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
  },
  formHeaderRow: {
    marginBottom: EPMAPS_SPACING.sm,
    paddingBottom: EPMAPS_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: EPMAPS_COLORS.bgSecondary,
  },
  formTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primaryDark,
  },
  formSubtitle: {
    fontSize: 12.5,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 2,
  },
  label: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    color: EPMAPS_COLORS.primaryDark,
    marginBottom: 6,
    marginTop: EPMAPS_SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: EPMAPS_TOUCH.minHeight,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.md,
    paddingHorizontal: EPMAPS_SPACING.md,
    backgroundColor: EPMAPS_COLORS.bgLight,
  },
  inputIcon: {
    marginRight: EPMAPS_SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: EPMAPS_TOUCH.minHeight,
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    color: EPMAPS_COLORS.textDark,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: EPMAPS_SPACING.lg,
    padding: EPMAPS_SPACING.md,
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderRadius: EPMAPS_RADII.md,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.dangerBorder,
  },
  errorText: {
    flex: 1,
    color: EPMAPS_COLORS.danger,
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
  },
  button: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.primary,
    borderRadius: EPMAPS_RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EPMAPS_SPACING.xl,
    paddingHorizontal: EPMAPS_SPACING.lg,
  },
  buttonDisabled: {
    backgroundColor: EPMAPS_COLORS.primaryDisabled,
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 16,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
  catalogCard: {
    marginTop: EPMAPS_SPACING.lg,
    padding: EPMAPS_SPACING.lg,
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.xs,
  },
  hintTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primaryDark,
  },
  hintDivider: {
    height: 1,
    backgroundColor: EPMAPS_COLORS.borderLight,
    marginVertical: EPMAPS_SPACING.xs,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  techRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: EPMAPS_COLORS.bgSecondary,
  },
  techRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techRowName: {
    fontSize: 13,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    color: EPMAPS_COLORS.textDark,
  },
  techRowCode: {
    fontSize: 12,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primary,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  techPinInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techPinLabel: {
    fontSize: 12,
    color: EPMAPS_COLORS.textMuted,
    marginRight: 4,
  },
  techPinValue: {
    fontSize: 12.5,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.textDark,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  hintFooter: {
    fontSize: 11.5,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.medium,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});

