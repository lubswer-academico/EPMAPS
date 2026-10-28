import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { getReadingById } from '@/storage/reading/readingDraftStorage';
import { formatReadingStatusLabel, isReadingEditable } from '@/domain/readingQueue/queueRules';
import { ConsolidatedReading } from '@/domain/reading/types';

export default function ReadingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [reading, setReading] = useState<ConsolidatedReading | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) {
        setIsLoading(false);
        setErrorMessage('Identificador de lectura no especificado.');
        return;
      }
      try {
        const item = await getReadingById(id);
        if (isMounted) {
          if (item) {
            setReading(item);
          } else {
            setErrorMessage('No se encontró la lectura solicitada.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err?.message || 'Error al cargar la lectura.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GlobalStatusBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#005C8A" />
          <Text style={styles.loadingText}>Cargando detalle de lectura...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !reading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GlobalStatusBar />
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a la bandeja"
          >
            <Text style={styles.backButtonText}>← Regresar</Text>
          </TouchableOpacity>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Aviso</Text>
            <Text style={styles.errorText}>{errorMessage || 'Lectura no disponible.'}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const editable = isReadingEditable(reading);
  const isSubmitted = reading.status === 'SUBMITTED';

  const handleEditReading = () => {
    router.push({
      pathname: '/reading-wizard',
      params: {
        meterCode: reading.meterCode,
        editingId: reading.id,
      },
    });
  };

  const formattedCapturedAt = new Date(reading.capturedAt).toLocaleString('es-EC');
  const formattedUpdatedAt = reading.updatedAt ? new Date(reading.updatedAt).toLocaleString('es-EC') : null;
  const formattedSyncedAt = reading.syncedAt ? new Date(reading.syncedAt).toLocaleString('es-EC') : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a la bandeja"
          >
            <Text style={styles.backButtonText}>← Regresar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalle de Lectura</Text>
          <Text style={styles.subtitle}>Medidor: {reading.meterCode}</Text>
        </View>

        {/* Banner de inmutabilidad si ya fue enviada */}
        {isSubmitted ? (
          <View style={styles.immutableBanner}>
            <Text style={styles.immutableBannerTitle}>Lectura Enviada (Solo Lectura)</Text>
            <Text style={styles.immutableBannerText}>
              Este registro ya fue transmitido a los sistemas centrales de la EPMAPS. Por seguridad y
              auditoría no es posible modificar ni eliminar sus datos.
            </Text>
          </View>
        ) : null}

        {/* Tarjeta de Datos de la Lectura */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información del Registro</Text>
            <View style={[styles.statusBadge, isSubmitted ? styles.badgeSubmitted : styles.badgePending]}>
              <Text style={[styles.statusBadgeText, isSubmitted ? styles.badgeTextSubmitted : styles.badgeTextPending]}>
                {formatReadingStatusLabel(reading.status)}
              </Text>
            </View>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Código de medidor:</Text>
            <Text style={styles.dataValue}>{reading.meterCode}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Condición física:</Text>
            <Text style={styles.dataValue}>{reading.condition}</Text>
          </View>

          {reading.inaccessibilityReason ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Motivo de inaccesibilidad:</Text>
              <Text style={styles.dataValue}>{reading.inaccessibilityReason}</Text>
            </View>
          ) : null}

          {reading.damageDescription ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Descripción del daño:</Text>
              <Text style={styles.dataValue}>{reading.damageDescription}</Text>
            </View>
          ) : null}

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Lectura actual:</Text>
            <Text style={styles.dataValue}>
              {reading.currentReading !== null && reading.currentReading !== undefined
                ? `${reading.currentReading} m³`
                : 'No aplica'}
            </Text>
          </View>

          {reading.previousReading !== null && reading.previousReading !== undefined ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Lectura anterior:</Text>
              <Text style={styles.dataValue}>{reading.previousReading} m³</Text>
            </View>
          ) : null}

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Consumo calculado:</Text>
            <Text style={styles.dataValue}>
              {reading.consumption !== null && reading.consumption !== undefined
                ? `${reading.consumption} m³`
                : reading.hasNoPreviousData
                ? 'Pendiente de verificar'
                : 'No aplica'}
            </Text>
          </View>

          {reading.isAnomaly ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Anomalía de consumo:</Text>
              <Text style={[styles.dataValue, styles.anomalyText]}>
                Supera 3x promedio (Confirmada)
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Fecha de captura:</Text>
            <Text style={styles.dataValue}>{formattedCapturedAt}</Text>
          </View>

          {formattedUpdatedAt ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Última edición:</Text>
              <Text style={styles.dataValue}>{formattedUpdatedAt}</Text>
            </View>
          ) : null}

          {formattedSyncedAt ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Fecha de envío:</Text>
              <Text style={styles.dataValue}>{formattedSyncedAt}</Text>
            </View>
          ) : null}
        </View>

        {/* Sección de Fotografía */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fotografía Adjunta</Text>
          {reading.photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: reading.photoUri }} style={styles.photo} />
            </View>
          ) : (
            <Text style={styles.noPhotoText}>No se adjuntó fotografía para este registro.</Text>
          )}
        </View>

        {/* Acciones de Edición (Habilitada solo si es editable) */}
        {editable ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditReading}
            accessibilityRole="button"
            accessibilityLabel="Editar Lectura"
          >
            <Text style={styles.editButtonText}>✏️ Editar Lectura</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  backButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    marginBottom: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#005C8A',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2A3A',
  },
  subtitle: {
    fontSize: 15,
    color: '#555555',
    marginTop: 2,
  },
  immutableBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#81C784',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  immutableBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  immutableBannerText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2A3A',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgePending: {
    backgroundColor: '#FFF8E1',
  },
  badgeSubmitted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextPending: {
    color: '#F57F17',
  },
  badgeTextSubmitted: {
    color: '#2E7D32',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666666',
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flexShrink: 1,
    textAlign: 'right',
  },
  anomalyText: {
    color: '#E65100',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  photoContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photo: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  noPhotoText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
    marginVertical: 6,
  },
  editButton: {
    minHeight: 48,
    backgroundColor: '#0288D1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF9A9A',
    padding: 16,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#B71C1C',
  },
});
