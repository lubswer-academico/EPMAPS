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
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { useMeterSearchController } from '@/presentation/meter/useMeterSearchController';

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
    // Listo para transicionar a la pantalla de captura (HU-003)
    // En obra blanca mostramos el estado de confirmación
    router.push({
      pathname: '/home',
      params: {
        capturedMeterCode: meterCodeInput,
        hasPriorData: hasPriorData ? 'true' : 'false',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a inicio"
          >
            <Text style={styles.backButtonText}>← Regresar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Consulta de Medidor</Text>
          <Text style={styles.subtitle}>
            Ingrese el código oficial del medidor (ej. MED-100201)
          </Text>
        </View>

        {/* Sección de Entrada de Código */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Código del Medidor</Text>
          <TextInput
            style={[
              styles.input,
              validationError ? styles.inputErrorBorder : null,
            ]}
            value={meterCodeInput}
            onChangeText={handleCodeChange}
            placeholder="MED-XXXXXX o dígitos"
            placeholderTextColor="#9E9E9E"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            accessibilityLabel="Campo de entrada de código de medidor"
          />

          {validationError ? (
            <Text style={styles.validationErrorText}>{validationError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!isValidCode || isSearching) ? styles.searchButtonDisabled : null,
            ]}
            onPress={searchMeter}
            disabled={!isValidCode || isSearching}
            accessibilityRole="button"
            accessibilityLabel="Consultar Medidor"
          >
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.searchButtonText}>Consultar Medidor</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Mensaje de Error General */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>Aviso</Text>
            <Text style={styles.errorBoxText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Caso Límite D3: Sin señal y sin datos en caché */}
        {noSignalNoDataWarning ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningBoxTitle}>Sin Cobertura de Red</Text>
            <Text style={styles.warningBoxText}>
              Sin conexión y sin datos en memoria de jornada. Los datos de cuenta y lectura anterior quedan pendientes de contrastar.
            </Text>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={proceedToCaptureWithoutData}
              accessibilityRole="button"
              accessibilityLabel="Continuar a captura sin datos previos"
            >
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
              <Text style={styles.recordCodeText}>{meterData.code}</Text>
              <View style={[styles.badge, isFromCache ? styles.badgeCache : styles.badgeOnline]}>
                <Text style={styles.badgeText}>
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
              <Text style={styles.dataValue}>{meterData.accountNumber}</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>4. Estado:</Text>
              <Text style={[styles.dataValue, styles.statusValue]}>
                {meterData.status.toUpperCase()}
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>5. Última Lectura:</Text>
              <Text style={styles.dataValue}>{meterData.lastReading.value} m³</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>6. Fecha Últ. Lectura:</Text>
              <Text style={styles.dataValue}>
                {new Date(meterData.lastReading.date).toLocaleDateString('es-EC')}
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>7. Consumo Promedio:</Text>
              <Text style={styles.dataValue}>{meterData.averageConsumption} m³/mes</Text>
            </View>
          </View>
        ) : null}

        {/* Caso Límite D4: Bloqueo o Alerta por Duplicidad Mensual R10 */}
        {duplicateBlock?.hasDuplicate ? (
          <View style={[
            styles.duplicateBox,
            duplicateBlock.isSubmitted ? styles.duplicateBoxBlocked : styles.duplicateBoxPending
          ]}>
            <Text style={styles.duplicateBoxTitle}>
              {duplicateBlock.isSubmitted ? 'Bloqueo por Duplicidad Mensual' : 'Lectura Mensual Existente'}
            </Text>
            <Text style={styles.duplicateBoxText}>{duplicateBlock.message}</Text>

            {duplicateBlock.canEditPending ? (
              <TouchableOpacity
                style={styles.editPendingButton}
                onPress={() => router.push('/home')}
                accessibilityRole="button"
                accessibilityLabel="Ver o editar lectura pendiente"
              >
                <Text style={styles.editPendingButtonText}>Ver / Editar lectura pendiente</Text>
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
              accessibilityRole="button"
              accessibilityLabel="Registrar Nueva Lectura"
            >
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
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0D47A1',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  inputErrorBorder: {
    borderColor: '#DC2626',
  },
  validationErrorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 6,
  },
  searchButton: {
    minHeight: 48,
    backgroundColor: '#0D47A1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  searchButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  errorBoxTitle: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  errorBoxText: {
    color: '#7F1D1D',
    fontSize: 14,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  warningBoxTitle: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  warningBoxText: {
    color: '#78350F',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  secondaryActionButton: {
    minHeight: 48,
    backgroundColor: '#D97706',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordCodeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D47A1',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeCache: {
    backgroundColor: '#E0F2FE',
  },
  badgeOnline: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  statusValue: {
    color: '#059669',
  },
  duplicateBox: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  duplicateBoxBlocked: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  duplicateBoxPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  duplicateBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  duplicateBoxText: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  editPendingButton: {
    minHeight: 48,
    backgroundColor: '#D97706',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  editPendingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  captureContainer: {
    marginTop: 8,
  },
  captureButton: {
    minHeight: 48,
    backgroundColor: '#16A34A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
