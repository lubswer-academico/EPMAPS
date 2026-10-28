import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { useMeterSearchController } from '@/presentation/meter/useMeterSearchController';
import {
  EPMAPS_COLORS,
  EPMAPS_RADII,
  EPMAPS_SPACING,
  EPMAPS_TOUCH,
} from '@/constants/theme';

export default function MeterSearchScreen() {
  const router = useRouter();
  const {
    meterCodeInput,
    isValidCode,
    validationError,
    isSearching,
    meterData,
    isFromCache,
    noSignalNoDataWarning,
    duplicateBlock,
    errorMessage,
    handleCodeChange,
    searchMeter,
    proceedToCaptureWithoutData,
    readyToCapture,
  } = useMeterSearchController();

  const handleNavigateToCapture = (hasPriorData: boolean) => {
    router.push({
      pathname: '/reading-wizard',
      params: {
        meterCode: meterData?.code || meterCodeInput,
        previousReading: meterData ? String(meterData.lastReading.value) : undefined,
        averageConsumption: meterData ? String(meterData.averageConsumption) : undefined,
        hasNoPreviousData: hasPriorData ? 'false' : 'true',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabecera de Navegación */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Regresar a inicio"
          >
            <View style={styles.backButtonBadge}>
              <Ionicons name="arrow-back" size={16} color={EPMAPS_COLORS.primaryDark} />
            </View>
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Consulta de Medidor</Text>
          <Text style={styles.subtitle}>
            Ingrese el código oficial del medidor (ej. MED-100201)
          </Text>
        </View>

        {/* Sección de Entrada de Código */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>CÓDIGO DEL MEDIDOR</Text>
          <TextInput
            style={[
              styles.input,
              validationError ? styles.inputErrorBorder : null,
            ]}
            value={meterCodeInput}
            onChangeText={handleCodeChange}
            placeholder="MED-XXXXXX o dígitos"
            placeholderTextColor={EPMAPS_COLORS.textSubtle}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            accessibilityLabel="Campo de entrada de código de medidor"
          />

          {validationError ? (
            <View style={styles.inlineErrorRow}>
              <Ionicons name="alert-circle" size={14} color={EPMAPS_COLORS.danger} style={styles.errorIcon} />
              <Text style={styles.validationErrorText}>{validationError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!isValidCode || isSearching) ? styles.searchButtonDisabled : null,
            ]}
            onPress={searchMeter}
            disabled={!isValidCode || isSearching}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Consultar Medidor"
          >
            {isSearching ? (
              <ActivityIndicator color={EPMAPS_COLORS.textInverse} />
            ) : (
              <View style={styles.buttonInnerRow}>
                <Ionicons name="search" size={18} color={EPMAPS_COLORS.textInverse} style={styles.buttonIcon} />
                <Text style={styles.searchButtonText}>Consultar Medidor</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Mensaje de Error General */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <View style={styles.alertHeaderRow}>
              <Ionicons name="alert-circle" size={18} color={EPMAPS_COLORS.danger} style={styles.alertHeaderIcon} />
              <Text style={styles.errorBoxTitle}>Aviso</Text>
            </View>
            <Text style={styles.errorBoxText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Caso Límite D3: Sin señal y sin datos en caché */}
        {noSignalNoDataWarning ? (
          <View style={styles.warningBox}>
            <View style={styles.alertHeaderRow}>
              <Ionicons name="cloud-offline-outline" size={20} color={EPMAPS_COLORS.warning} style={styles.alertHeaderIcon} />
              <Text style={styles.warningBoxTitle}>Sin Cobertura de Red</Text>
            </View>
            <Text style={styles.warningBoxText}>
              Sin conexión y sin datos en memoria de jornada. Los datos de cuenta y lectura anterior quedan pendientes de contrastar.
            </Text>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={proceedToCaptureWithoutData}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Continuar a captura sin datos previos"
            >
              <Ionicons name="arrow-forward-circle-outline" size={18} color={EPMAPS_COLORS.textInverse} style={styles.buttonIcon} />
              <Text style={styles.secondaryActionButtonText}>
                Continuar a captura sin datos previos
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Ficha Técnica / Comercial del Medidor (7 campos) */}
        {meterData ? (
          <View style={styles.recordCard}>
            <View style={styles.recordHeaderRow}>
              <View style={styles.recordTitleCol}>
                <Text style={styles.recordCategoryLabel}>MEDIDOR IDENTIFICADO</Text>
                <Text style={styles.recordCodeText}>{meterData.code}</Text>
              </View>
              <View style={[styles.badge, isFromCache ? styles.badgeCache : styles.badgeOnline]}>
                <Ionicons
                  name={isFromCache ? 'hardware-chip-outline' : 'cloud-done-outline'}
                  size={13}
                  color={isFromCache ? EPMAPS_COLORS.accentDark : EPMAPS_COLORS.success}
                  style={styles.badgeIcon}
                />
                <Text style={[styles.badgeText, isFromCache ? styles.badgeCacheText : styles.badgeOnlineText]}>
                  {isFromCache ? 'Memoria de Jornada' : 'Oficina en Línea'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 7 Campos obligatorios */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>1. Dirección:</Text>
              <Text style={styles.dataValue}>{meterData.address}</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>2. Sector:</Text>
              <Text style={styles.dataValue}>{meterData.sector}</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>3. Nro. Cuenta:</Text>
              <Text style={[styles.dataValue, styles.accountValue]}>{meterData.accountNumber}</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>4. Estado:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {meterData.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>5. Última Lectura:</Text>
              <Text style={[styles.dataValue, styles.readingValue]}>{meterData.lastReading.value} m³</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>6. Fecha Últ. Lectura:</Text>
              <Text style={styles.dataValue}>
                {new Date(meterData.lastReading.date).toLocaleDateString('es-EC')}
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>7. Consumo Promedio:</Text>
              <Text style={[styles.dataValue, styles.averageValue]}>{meterData.averageConsumption} m³/mes</Text>
            </View>
          </View>
        ) : null}

        {/* Caso Límite D4: Bloqueo o Alerta por Duplicidad Mensual R10 */}
        {duplicateBlock?.hasDuplicate ? (
          <View style={[
            styles.duplicateBox,
            duplicateBlock.isSubmitted ? styles.duplicateBoxBlocked : styles.duplicateBoxPending
          ]}>
            <View style={styles.alertHeaderRow}>
              <Ionicons
                name={duplicateBlock.isSubmitted ? 'lock-closed' : 'alert-circle'}
                size={20}
                color={duplicateBlock.isSubmitted ? EPMAPS_COLORS.danger : EPMAPS_COLORS.warning}
                style={styles.alertHeaderIcon}
              />
              <Text style={[
                styles.duplicateBoxTitle,
                duplicateBlock.isSubmitted ? styles.duplicateTitleBlocked : styles.duplicateTitlePending
              ]}>
                {duplicateBlock.isSubmitted ? 'Bloqueo por Duplicidad Mensual' : 'Lectura Mensual Existente'}
              </Text>
            </View>
            <Text style={[
              styles.duplicateBoxText,
              duplicateBlock.isSubmitted ? styles.duplicateTextBlocked : styles.duplicateTextPending
            ]}>
              {duplicateBlock.message}
            </Text>

            {duplicateBlock.canEditPending ? (
              <TouchableOpacity
                style={styles.editPendingButton}
                onPress={() => router.push('/reading-queue')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ver o editar lectura pendiente"
              >
                <Ionicons name="file-tray-stacked-outline" size={18} color={EPMAPS_COLORS.textInverse} style={styles.buttonIcon} />
                <Text style={styles.editPendingButtonText}>Ver / Editar en Bandeja de Lecturas</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Botón de Acción Principal para Iniciar Captura */}
        {readyToCapture && !duplicateBlock?.hasDuplicate ? (
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => handleNavigateToCapture(!!meterData)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Registrar Nueva Lectura"
            >
              <Ionicons name="create-outline" size={22} color={EPMAPS_COLORS.textInverse} style={styles.buttonIcon} />
              <Text style={styles.captureButtonText}>Registrar Nueva Lectura</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: EPMAPS_COLORS.bgLight,
  },
  container: {
    padding: EPMAPS_SPACING.lg,
    paddingBottom: EPMAPS_SPACING.hero,
  },
  // Cabecera de Navegación
  header: {
    marginBottom: EPMAPS_SPACING.lg,
  },
  backButton: {
    minHeight: EPMAPS_TOUCH.minHeight,
    minWidth: EPMAPS_TOUCH.minWidth,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.xs,
    alignSelf: 'flex-start',
  },
  backButtonBadge: {
    width: 32,
    height: 32,
    borderRadius: EPMAPS_RADII.sm,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EPMAPS_SPACING.sm,
  },
  backButtonText: {
    fontSize: 15,
    color: EPMAPS_COLORS.primaryDark,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 3,
  },
  // Formulario de Búsqueda
  inputContainer: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    marginBottom: EPMAPS_SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 0.6,
    marginBottom: EPMAPS_SPACING.sm,
  },
  input: {
    minHeight: EPMAPS_TOUCH.minHeight,
    borderWidth: 1.2,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.md,
    paddingHorizontal: EPMAPS_SPACING.md,
    fontSize: 17,
    fontWeight: '700',
    color: EPMAPS_COLORS.textDark,
    backgroundColor: EPMAPS_COLORS.bgLight,
  },
  inputErrorBorder: {
    borderColor: EPMAPS_COLORS.danger,
    backgroundColor: EPMAPS_COLORS.dangerSoftBg,
  },
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorIcon: {
    marginRight: 4,
  },
  validationErrorText: {
    color: EPMAPS_COLORS.danger,
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  searchButton: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.primary,
    borderRadius: EPMAPS_RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EPMAPS_SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonDisabled: {
    backgroundColor: '#93C5FD',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 15.5,
    fontWeight: '700',
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  // Banners de Alerta
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertHeaderIcon: {
    marginRight: 6,
  },
  errorBox: {
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderColor: EPMAPS_COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: EPMAPS_RADII.md,
    padding: EPMAPS_SPACING.md,
    marginBottom: EPMAPS_SPACING.lg,
  },
  errorBoxTitle: {
    color: EPMAPS_COLORS.danger,
    fontWeight: '800',
    fontSize: 14,
  },
  errorBoxText: {
    color: '#7F1D1D',
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: EPMAPS_COLORS.warningBg,
    borderColor: EPMAPS_COLORS.warningBorder,
    borderWidth: 1,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.md,
    marginBottom: EPMAPS_SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  warningBoxTitle: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 14.5,
  },
  warningBoxText: {
    color: '#78350F',
    fontSize: 13,
    marginBottom: EPMAPS_SPACING.md,
    lineHeight: 19,
  },
  secondaryActionButton: {
    minHeight: EPMAPS_TOUCH.minHeight,
    backgroundColor: EPMAPS_COLORS.warning,
    borderRadius: EPMAPS_RADII.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: EPMAPS_SPACING.md,
  },
  secondaryActionButtonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 13.5,
    fontWeight: '700',
  },
  // Ficha Técnica y Comercial (7 Campos)
  recordCard: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    marginBottom: EPMAPS_SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitleCol: {
    flex: 1,
  },
  recordCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: EPMAPS_COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  recordCodeText: {
    fontSize: 20,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: EPMAPS_RADII.full,
    borderWidth: 1,
  },
  badgeCache: {
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderColor: '#BAE6FD',
  },
  badgeOnline: {
    backgroundColor: EPMAPS_COLORS.successBg,
    borderColor: EPMAPS_COLORS.successBorder,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeCacheText: {
    color: EPMAPS_COLORS.accentDark,
  },
  badgeOnlineText: {
    color: EPMAPS_COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: EPMAPS_COLORS.borderLight,
    marginVertical: EPMAPS_SPACING.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 13,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: '600',
  },
  dataValue: {
    fontSize: 13.5,
    color: EPMAPS_COLORS.textDark,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  accountValue: {
    color: EPMAPS_COLORS.primaryDark,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: EPMAPS_COLORS.successBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: EPMAPS_RADII.sm,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.successBorder,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: EPMAPS_COLORS.success,
  },
  readingValue: {
    color: EPMAPS_COLORS.textDark,
    fontWeight: '800',
  },
  averageValue: {
    color: EPMAPS_COLORS.primary,
    fontWeight: '800',
  },
  // Bloqueo / Duplicidad R10
  duplicateBox: {
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.md,
    borderWidth: 1,
    marginBottom: EPMAPS_SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  duplicateBoxBlocked: {
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderColor: EPMAPS_COLORS.dangerBorder,
  },
  duplicateBoxPending: {
    backgroundColor: EPMAPS_COLORS.warningBg,
    borderColor: EPMAPS_COLORS.warningBorder,
  },
  duplicateBoxTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  duplicateTitleBlocked: {
    color: EPMAPS_COLORS.danger,
  },
  duplicateTitlePending: {
    color: '#92400E',
  },
  duplicateBoxText: {
    fontSize: 13,
    lineHeight: 18,
  },
  duplicateTextBlocked: {
    color: '#7F1D1D',
  },
  duplicateTextPending: {
    color: '#78350F',
  },
  editPendingButton: {
    minHeight: EPMAPS_TOUCH.minHeight,
    backgroundColor: EPMAPS_COLORS.warning,
    borderRadius: EPMAPS_RADII.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EPMAPS_SPACING.md,
  },
  editPendingButtonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 13.5,
    fontWeight: '700',
  },
  // Botón de Captura Maestro
  captureContainer: {
    marginTop: EPMAPS_SPACING.xs,
  },
  captureButton: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.success,
    borderRadius: EPMAPS_RADII.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  captureButtonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

