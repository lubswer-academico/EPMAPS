import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GlobalStatusBar } from '../components/GlobalStatusBar';
import { useReadingWizardController } from '../presentation/reading/useReadingWizardController';
import { MeterCondition } from '../domain/reading/types';

export default function ReadingWizardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    meterCode?: string;
    previousReading?: string;
    averageConsumption?: string;
    hasNoPreviousData?: string;
  }>();

  const meterCode = params.meterCode || 'MED-000000';
  const previousReading = params.previousReading ? Number(params.previousReading) : null;
  const averageConsumption = params.averageConsumption ? Number(params.averageConsumption) : null;
  const hasNoPreviousData = params.hasNoPreviousData === 'true';

  const {
    currentStep,
    draft,
    requirements,
    consumptionInfo,
    isAnomaly,
    hasExistingDraft,
    isSaving,
    cameraPermissionDenied,
    validationError,
    setCondition,
    setInaccessibilityReason,
    setDamageDescription,
    setCurrentReading,
    setAnomalyConfirmed,
    goToNextStep,
    goToPreviousStep,
    capturePhoto,
    removePhoto,
    resumeExistingDraft,
    discardExistingDraft,
    submitFinalReading,
  } = useReadingWizardController({
    meterCode,
    previousReading,
    averageConsumption,
    hasNoPreviousData,
  });

  const handleFinish = async () => {
    const success = await submitFinalReading();
    if (success) {
      Alert.alert(
        'Lectura Registrada',
        `La lectura del medidor ${meterCode} ha sido guardada en la cola local de pendientes.`,
        [
          {
            text: 'Aceptar',
            onPress: () => router.replace('/home'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      {/* Modal/Banner de detección de borrador previo */}
      {hasExistingDraft ? (
        <View style={styles.draftModalContainer}>
          <View style={styles.draftModalCard}>
            <Text style={styles.draftModalTitle}>Borrador Pendiente Detectado</Text>
            <Text style={styles.draftModalText}>
              Existe una captura iniciada previamente para el medidor {meterCode}. ¿Desea reanudarla
              o descartarla para comenzar de nuevo?
            </Text>
            <View style={styles.draftModalActions}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={discardExistingDraft}
                accessibilityRole="button"
                accessibilityLabel="Descartar borrador"
              >
                <Text style={styles.discardButtonText}>Descartar borrador</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={resumeExistingDraft}
                accessibilityRole="button"
                accessibilityLabel="Reanudar captura"
              >
                <Text style={styles.resumeButtonText}>Reanudar captura</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Encabezado y Navegación Superior */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a consulta"
          >
            <Text style={styles.backButtonText}>← Regresar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Toma de Lectura</Text>
          <Text style={styles.subtitle}>Medidor: {meterCode}</Text>
        </View>

        {/* Indicador de Pasos del Wizard */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepBadge, currentStep === 1 && styles.stepBadgeActive]}>
            <Text style={[styles.stepBadgeText, currentStep === 1 && styles.stepBadgeTextActive]}>
              1. Condición
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepBadge, currentStep === 2 && styles.stepBadgeActive]}>
            <Text style={[styles.stepBadgeText, currentStep === 2 && styles.stepBadgeTextActive]}>
              2. Lectura
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepBadge, currentStep === 3 && styles.stepBadgeActive]}>
            <Text style={[styles.stepBadgeText, currentStep === 3 && styles.stepBadgeTextActive]}>
              3. Foto
            </Text>
          </View>
        </View>

        {/* Alerta de Error de Validación */}
        {validationError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>Atención requerida</Text>
            <Text style={styles.errorBoxText}>{validationError}</Text>
          </View>
        ) : null}

        {/* CONTENIDO DEL PASO 1: Condición del Medidor */}
        {currentStep === 1 ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepSectionTitle}>Seleccione la condición física</Text>
            <View style={styles.conditionOptions}>
              {(['Normal', 'Inaccesible', 'Dañado'] as MeterCondition[]).map((cond) => {
                const isSelected = draft.condition === cond;
                return (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.conditionCard, isSelected && styles.conditionCardSelected]}
                    onPress={() => setCondition(cond)}
                    accessibilityRole="button"
                    accessibilityLabel={`Condición ${cond}`}
                  >
                    <Text
                      style={[
                        styles.conditionCardText,
                        isSelected && styles.conditionCardTextSelected,
                      ]}
                    >
                      {cond}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Campo Motivo de Inaccesibilidad */}
            {requirements.reasonRequired ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Motivo de Inaccesibilidad *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={draft.inaccessibilityReason || ''}
                  onChangeText={setInaccessibilityReason}
                  placeholder="Ej. Reja cerrada, perro peligroso, terreno anegado..."
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={3}
                  accessibilityLabel="Motivo de inaccesibilidad"
                />
              </View>
            ) : null}

            {/* Campo Descripción del Daño */}
            {requirements.damageDescriptionRequired ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción del Daño *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={draft.damageDescription || ''}
                  onChangeText={setDamageDescription}
                  placeholder="Ej. Visor roto, esfera empañada, medidor trabado o manipulado..."
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={3}
                  accessibilityLabel="Descripción del daño"
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {/* CONTENIDO DEL PASO 2: Lectura Numérica y Consumo */}
        {currentStep === 2 ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepSectionTitle}>Ingreso de Lectura Actual</Text>

            {requirements.readingDisabled ? (
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  Medidor catalogado como Inaccesible. La captura de lectura numérica está
                  deshabilitada para esta condición.
                </Text>
              </View>
            ) : (
              <View>
                {/* Referencias Previas */}
                <View style={styles.referenceContainer}>
                  <Text style={styles.referenceText}>
                    Lectura anterior:{' '}
                    {draft.previousReading !== null && draft.previousReading !== undefined
                      ? `${draft.previousReading} m³`
                      : 'Sin datos previos'}
                  </Text>
                  <Text style={styles.referenceText}>
                    Consumo promedio:{' '}
                    {draft.averageConsumption !== null && draft.averageConsumption !== undefined
                      ? `${draft.averageConsumption} m³/mes`
                      : 'Sin datos previos'}
                  </Text>
                </View>

                {/* Input Lectura */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Lectura Actual (m³){requirements.readingRequired ? ' *' : ' (Opcional)'}
                  </Text>
                  <TextInput
                    style={styles.numericInput}
                    value={draft.currentReading !== null && draft.currentReading !== undefined ? String(draft.currentReading) : ''}
                    onChangeText={setCurrentReading}
                    placeholder="0"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="number-pad"
                    accessibilityLabel="Lectura actual en metros cúbicos"
                  />
                </View>

                {/* Consumo Calculado y Verificación */}
                {consumptionInfo.isPendingVerification ? (
                  <View style={styles.infoBadgePending}>
                    <Text style={styles.infoBadgePendingText}>
                      Consumo: Pendiente de verificar (modo contingencia sin datos previos)
                    </Text>
                  </View>
                ) : consumptionInfo.consumption !== null ? (
                  <View style={styles.consumptionBox}>
                    <Text style={styles.consumptionLabel}>Consumo mensual calculado:</Text>
                    <Text
                      style={[
                        styles.consumptionValue,
                        !consumptionInfo.isValidConsistency && styles.consumptionValueDanger,
                      ]}
                    >
                      {consumptionInfo.consumption} m³
                    </Text>
                  </View>
                ) : null}

                {/* Inconsistencia física: menor a anterior */}
                {!consumptionInfo.isValidConsistency && consumptionInfo.errorMessage ? (
                  <View style={styles.dangerAlertBox}>
                    <Text style={styles.dangerAlertTitle}>Inconsistencia Física</Text>
                    <Text style={styles.dangerAlertText}>{consumptionInfo.errorMessage}</Text>
                  </View>
                ) : null}

                {/* Anomalía: Consumo > 3x promedio */}
                {isAnomaly ? (
                  <View style={styles.anomalyBox}>
                    <Text style={styles.anomalyTitle}>ALERTA: Consumo Anómalo Detectado</Text>
                    <Text style={styles.anomalyText}>
                      El consumo calculado ({consumptionInfo.consumption} m³) supera en más de 3
                      veces el consumo promedio histórico ({draft.averageConsumption} m³/mes).
                    </Text>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => setAnomalyConfirmed(!draft.anomalyConfirmed)}
                      accessibilityRole="checkbox"
                      accessibilityLabel="Confirmar revisión física de lectura"
                    >
                      <View
                        style={[
                          styles.checkboxSquare,
                          draft.anomalyConfirmed && styles.checkboxSquareChecked,
                        ]}
                      >
                        {draft.anomalyConfirmed ? (
                          <Text style={styles.checkmarkText}>✓</Text>
                        ) : null}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        He revisado físicamente el visor del medidor y confirmo que la lectura es correcta.
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        ) : null}

        {/* CONTENIDO DEL PASO 3: Fotografía y Resumen */}
        {currentStep === 3 ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepSectionTitle}>Evidencia Fotográfica</Text>

            {requirements.photoRequired ? (
              <View style={styles.requirementBanner}>
                <Text style={styles.requirementBannerText}>
                  * La fotografía es estrictamente obligatoria para esta lectura (por condición de
                  daño o consumo anómalo).
                </Text>
              </View>
            ) : (
              <View style={styles.optionalBanner}>
                <Text style={styles.optionalBannerText}>
                  La fotografía es opcional para medidores normales sin anomalía o inaccesibles.
                </Text>
              </View>
            )}

            {cameraPermissionDenied ? (
              <View style={styles.dangerAlertBox}>
                <Text style={styles.dangerAlertTitle}>Permiso de Cámara Denegado</Text>
                <Text style={styles.dangerAlertText}>
                  Se requieren permisos de acceso a la cámara para capturar la evidencia. Por favor
                  habilítelos en los ajustes del terminal.
                </Text>
              </View>
            ) : null}

            {/* Vista Previa de la Foto o Botón de Disparo */}
            {draft.photoUri ? (
              <View style={styles.photoPreviewCard}>
                <Image source={{ uri: draft.photoUri }} style={styles.photoPreviewImage} />
                <View style={styles.photoActionsRow}>
                  <TouchableOpacity
                    style={styles.retakePhotoButton}
                    onPress={capturePhoto}
                    accessibilityRole="button"
                    accessibilityLabel="Repetir fotografía"
                  >
                    <Text style={styles.retakePhotoButtonText}>Repetir Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={removePhoto}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar fotografía"
                  >
                    <Text style={styles.deletePhotoButtonText}>Eliminar Foto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cameraTriggerButton}
                onPress={capturePhoto}
                accessibilityRole="button"
                accessibilityLabel="Abrir cámara y capturar foto"
              >
                <Text style={styles.cameraTriggerIcon}>📷</Text>
                <Text style={styles.cameraTriggerText}>Tomar Fotografía del Medidor</Text>
              </TouchableOpacity>
            )}

            {/* Resumen Final de Captura */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumen de Registro</Text>
              <Text style={styles.summaryItem}>• Medidor: {draft.meterCode}</Text>
              <Text style={styles.summaryItem}>• Condición: {draft.condition}</Text>
              {draft.inaccessibilityReason ? (
                <Text style={styles.summaryItem}>• Motivo: {draft.inaccessibilityReason}</Text>
              ) : null}
              {draft.damageDescription ? (
                <Text style={styles.summaryItem}>• Daño: {draft.damageDescription}</Text>
              ) : null}
              {draft.currentReading !== null && draft.currentReading !== undefined ? (
                <Text style={styles.summaryItem}>• Lectura: {draft.currentReading} m³</Text>
              ) : null}
              {draft.consumption !== null && draft.consumption !== undefined ? (
                <Text style={styles.summaryItem}>• Consumo: {draft.consumption} m³</Text>
              ) : null}
              {draft.isAnomaly ? (
                <Text style={styles.summaryItem}>• Anomalía: Confirmada físicamente</Text>
              ) : null}
              <Text style={styles.summaryItem}>
                • Fotografía: {draft.photoUri ? 'Adjuntada' : 'No adjuntada'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Barra de Navegación de Pasos y Finalización */}
        <View style={styles.footerActions}>
          {currentStep > 1 ? (
            <TouchableOpacity
              style={styles.navButtonSecondary}
              onPress={goToPreviousStep}
              accessibilityRole="button"
              accessibilityLabel="Paso anterior"
            >
              <Text style={styles.navButtonSecondaryText}>← Anterior</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {currentStep < 3 ? (
            <TouchableOpacity
              style={styles.navButtonPrimary}
              onPress={goToNextStep}
              accessibilityRole="button"
              accessibilityLabel="Siguiente paso"
            >
              <Text style={styles.navButtonPrimaryText}>Siguiente →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButtonFinish, isSaving && styles.buttonDisabled]}
              onPress={handleFinish}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Finalizar y guardar en cola local"
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.navButtonFinishText}>Finalizar y Guardar</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#005C8A',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2A3A',
  },
  subtitle: {
    fontSize: 15,
    color: '#555555',
    marginTop: 2,
  },
  // Indicador de pasos
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  stepBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  stepBadgeActive: {
    backgroundColor: '#005C8A',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  // Alertas
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#E57373',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 4,
  },
  errorBoxText: {
    fontSize: 13,
    color: '#B71C1C',
  },
  // Modal de Borrador
  draftModalContainer: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFB300',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  draftModalCard: {},
  draftModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8D6E63',
    marginBottom: 6,
  },
  draftModalText: {
    fontSize: 14,
    color: '#4E342E',
    marginBottom: 14,
    lineHeight: 20,
  },
  draftModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  discardButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
  },
  discardButtonText: {
    color: '#455A64',
    fontWeight: '600',
    fontSize: 14,
  },
  resumeButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005C8A',
    borderRadius: 6,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Contenido de pasos
  stepContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  stepSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2A3A',
    marginBottom: 14,
  },
  // Paso 1
  conditionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  conditionCard: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBE7',
  },
  conditionCardSelected: {
    borderColor: '#005C8A',
    backgroundColor: '#E1F5FE',
  },
  conditionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
  },
  conditionCardTextSelected: {
    color: '#005C8A',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  // Paso 2
  referenceContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  referenceText: {
    fontSize: 14,
    color: '#424242',
    marginVertical: 2,
  },
  numericInput: {
    borderWidth: 2,
    borderColor: '#005C8A',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#005C8A',
    paddingHorizontal: 16,
    minHeight: 52,
    backgroundColor: '#FAFAFA',
  },
  consumptionBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
  },
  consumptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  consumptionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  consumptionValueDanger: {
    color: '#C62828',
  },
  infoBadgePending: {
    backgroundColor: '#EDE7F6',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  infoBadgePendingText: {
    fontSize: 13,
    color: '#4527A0',
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: '#ECEFF1',
    padding: 14,
    borderRadius: 6,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#455A64',
    lineHeight: 20,
  },
  dangerAlertBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: 6,
    padding: 12,
    marginVertical: 10,
  },
  dangerAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 4,
  },
  dangerAlertText: {
    fontSize: 13,
    color: '#B71C1C',
    lineHeight: 18,
  },
  anomalyBox: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FFA726',
    borderRadius: 8,
    padding: 14,
    marginVertical: 12,
  },
  anomalyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 6,
  },
  anomalyText: {
    fontSize: 13,
    color: '#BF360C',
    lineHeight: 18,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  checkboxSquare: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: '#E65100',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSquareChecked: {
    backgroundColor: '#E65100',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#BF360C',
    fontWeight: '600',
  },
  // Paso 3
  requirementBanner: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  requirementBannerText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },
  optionalBanner: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  optionalBannerText: {
    fontSize: 13,
    color: '#2E7D32',
  },
  cameraTriggerButton: {
    borderWidth: 2,
    borderColor: '#005C8A',
    borderStyle: 'dashed',
    borderRadius: 8,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FA',
    marginBottom: 16,
  },
  cameraTriggerIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  cameraTriggerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#005C8A',
  },
  photoPreviewCard: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    marginBottom: 16,
  },
  photoPreviewImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#ECEFF1',
  },
  photoActionsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'space-between',
    gap: 10,
  },
  retakePhotoButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#005C8A',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakePhotoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deletePhotoButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletePhotoButtonText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 13,
    color: '#555555',
    marginVertical: 2,
  },
  // Footer acciones
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButtonSecondary: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#ECEFF1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#455A64',
  },
  navButtonPrimary: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#005C8A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navButtonFinish: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonFinishText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
