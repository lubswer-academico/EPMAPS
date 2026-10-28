import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { getReadingById, deleteConsolidatedReading } from '@/storage/reading/readingDraftStorage';
import { deletePhoto } from '@/services/photo/photoStorageService';
import { formatReadingStatusLabel, isReadingEditable } from '@/domain/readingQueue/queueRules';
import { ConsolidatedReading } from '@/domain/reading/types';
import {
  EPMAPS_COLORS,
  EPMAPS_RADII,
  EPMAPS_SPACING,
  EPMAPS_TOUCH,
  EPMAPS_TYPOGRAPHY,
} from '@/constants/theme';

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
          <ActivityIndicator size="large" color={EPMAPS_COLORS.primary} />
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
            activeOpacity={0.8}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a la bandeja"
          >
            <View style={styles.backButtonBadge}>
              <Ionicons name="arrow-back" size={16} color={EPMAPS_COLORS.primaryDark} />
            </View>
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
          <View style={styles.errorCard}>
            <View style={styles.bannerHeaderRow}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={EPMAPS_COLORS.danger}
                style={styles.bannerLeadIcon}
              />
              <Text style={styles.errorTitle}>Aviso</Text>
            </View>
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

  const handleDeleteReading = () => {
    Alert.alert(
      'Descartar lectura',
      `¿Está seguro de descartar y eliminar permanentemente esta lectura del medidor ${reading.meterCode}? Se borrará la fotografía asociada y se actualizará la cola.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (reading.photoUri) {
                await deletePhoto(reading.photoUri);
              }
              await deleteConsolidatedReading(reading.id);
              Alert.alert('Lectura descartada', 'La lectura fue eliminada de la cola local.', [
                {
                  text: 'Aceptar',
                  onPress: () => router.replace('/reading-queue'),
                },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo descartar la lectura.');
            }
          },
        },
      ]
    );
  };

  const formattedCapturedAt = new Date(reading.capturedAt).toLocaleString('es-EC');
  const formattedUpdatedAt = reading.updatedAt
    ? new Date(reading.updatedAt).toLocaleString('es-EC')
    : null;
  const formattedSyncedAt = reading.syncedAt
    ? new Date(reading.syncedAt).toLocaleString('es-EC')
    : null;

  const getStatusBadgeStyle = (status: ConsolidatedReading['status']) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return styles.badgeVerification;
      case 'PENDING_SYNC':
        return styles.badgePending;
      case 'REQUIRES_ATTENTION':
        return styles.badgeAttention;
      case 'SUBMITTED':
        return styles.badgeSubmitted;
    }
  };

  const getStatusTextStyle = (status: ConsolidatedReading['status']) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return styles.badgeTextVerification;
      case 'PENDING_SYNC':
        return styles.badgeTextPending;
      case 'REQUIRES_ATTENTION':
        return styles.badgeTextAttention;
      case 'SUBMITTED':
        return styles.badgeTextSubmitted;
    }
  };

  const getStatusIconConfig = (
    status: ConsolidatedReading['status']
  ): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return { name: 'shield-half-outline', color: EPMAPS_COLORS.verification };
      case 'PENDING_SYNC':
        return { name: 'cloud-upload-outline', color: EPMAPS_COLORS.pendingSync };
      case 'REQUIRES_ATTENTION':
        return { name: 'warning-outline', color: EPMAPS_COLORS.attention };
      case 'SUBMITTED':
        return { name: 'checkmark-circle', color: EPMAPS_COLORS.success };
    }
  };

  const statusIcon = getStatusIconConfig(reading.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar a la bandeja"
          >
            <View style={styles.backButtonBadge}>
              <Ionicons name="arrow-back" size={16} color={EPMAPS_COLORS.primaryDark} />
            </View>
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.title}>Detalle de Lectura</Text>
              <Text style={styles.subtitle}>Medidor: {reading.meterCode}</Text>
            </View>
            <View style={styles.meterPill}>
              <Ionicons
                name="speedometer-outline"
                size={14}
                color={EPMAPS_COLORS.accentDark}
                style={styles.meterPillIcon}
              />
              <Text style={styles.meterPillText}>{reading.meterCode}</Text>
            </View>
          </View>
        </View>

        {/* Banner de inmutabilidad si ya fue enviada */}
        {isSubmitted ? (
          <View style={styles.immutableBanner}>
            <View style={styles.bannerHeaderRow}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={EPMAPS_COLORS.success}
                style={styles.bannerLeadIcon}
              />
              <Text style={styles.immutableBannerTitle}>Lectura Enviada (Solo Lectura)</Text>
            </View>
            <Text style={styles.immutableBannerText}>
              Este registro ya fue transmitido a los sistemas centrales de la EPMAPS. Por seguridad y
              auditoría no es posible modificar ni eliminar sus datos.
            </Text>
          </View>
        ) : null}

        {/* Banner si requiere atención por anomalía imprevista o medidor inexistente */}
        {reading.status === 'REQUIRES_ATTENTION' ? (
          <View style={styles.attentionBanner}>
            <View style={styles.bannerHeaderRow}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={EPMAPS_COLORS.attention}
                style={styles.bannerLeadIcon}
              />
              <Text style={styles.attentionBannerTitle}>Requiere Atención en Campo</Text>
            </View>
            <Text style={styles.attentionBannerText}>
              {reading.requiresAttentionReason ||
                'Al cotejar esta lectura con la oficina se detectó una discrepancia o anomalía de consumo. Por favor revise o edite el registro.'}
            </Text>
          </View>
        ) : null}

        {/* Tarjeta de Datos de la Lectura */}
        <View style={styles.card}>
          <Text style={styles.cardCategoryLabel}>FICHA DE REGISTRO • AUDITORÍA</Text>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información del Registro</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(reading.status)]}>
              <Ionicons
                name={statusIcon.name}
                size={13}
                color={statusIcon.color}
                style={styles.statusBadgeIcon}
              />
              <Text style={[styles.statusBadgeText, getStatusTextStyle(reading.status)]}>
                {formatReadingStatusLabel(reading.status)}
              </Text>
            </View>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Código de medidor:</Text>
            <Text style={[styles.dataValue, styles.tabularValue]}>{reading.meterCode}</Text>
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
            <Text style={[styles.dataValue, styles.tabularValue]}>
              {reading.currentReading !== null && reading.currentReading !== undefined
                ? `${reading.currentReading} m³`
                : 'No aplica'}
            </Text>
          </View>

          {reading.previousReading !== null && reading.previousReading !== undefined ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Lectura anterior:</Text>
              <Text style={[styles.dataValue, styles.tabularValue]}>
                {reading.previousReading} m³
              </Text>
            </View>
          ) : null}

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Consumo calculado:</Text>
            <Text style={[styles.dataValue, styles.tabularValue]}>
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
            <Text style={[styles.dataValue, styles.tabularValue]}>{formattedCapturedAt}</Text>
          </View>

          {formattedUpdatedAt ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Última edición:</Text>
              <Text style={[styles.dataValue, styles.tabularValue]}>{formattedUpdatedAt}</Text>
            </View>
          ) : null}

          {formattedSyncedAt ? (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Fecha de envío:</Text>
              <Text style={[styles.dataValue, styles.tabularValue]}>{formattedSyncedAt}</Text>
            </View>
          ) : null}
        </View>

        {/* Sección de Fotografía */}
        <View style={styles.card}>
          <Text style={styles.cardCategoryLabel}>EVIDENCIA VISUAL • RESPALDO</Text>
          <Text style={styles.sectionTitle}>Fotografía Adjunta</Text>
          {reading.photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: reading.photoUri }} style={styles.photo} />
            </View>
          ) : (
            <View style={styles.noPhotoBox}>
              <Ionicons
                name="camera-outline"
                size={20}
                color={EPMAPS_COLORS.textMuted}
                style={styles.noPhotoIcon}
              />
              <Text style={styles.noPhotoText}>
                No se adjuntó fotografía para este registro.
              </Text>
            </View>
          )}
        </View>

        {/* Acciones de Edición y Descarte (Habilitadas solo si es editable) */}
        {editable ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.85}
              onPress={handleEditReading}
              accessibilityRole="button"
              accessibilityLabel="Editar Lectura"
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={EPMAPS_COLORS.textInverse}
                style={styles.actionButtonIcon}
              />
              <Text style={styles.editButtonText}>Editar Lectura</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.85}
              onPress={handleDeleteReading}
              accessibilityRole="button"
              accessibilityLabel="Descartar lectura"
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={EPMAPS_COLORS.danger}
                style={styles.actionButtonIcon}
              />
              <Text style={styles.deleteButtonText}>Descartar lectura</Text>
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
    paddingBottom: EPMAPS_SPACING.hero + EPMAPS_SPACING.sm,
  },
  header: {
    marginBottom: EPMAPS_SPACING.lg,
  },
  backButton: {
    minHeight: EPMAPS_TOUCH.minHeight,
    minWidth: EPMAPS_TOUCH.minWidth,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: EPMAPS_SPACING.xs,
    paddingRight: EPMAPS_SPACING.md,
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
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    color: EPMAPS_COLORS.primaryDark,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
    marginRight: EPMAPS_SPACING.sm,
  },
  title: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.xl,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 2,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  meterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    paddingHorizontal: EPMAPS_SPACING.sm,
    paddingVertical: 5,
    borderRadius: EPMAPS_RADII.full,
  },
  meterPillIcon: {
    marginRight: 4,
  },
  meterPillText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.xs,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.accentDark,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerLeadIcon: {
    marginRight: 6,
  },
  immutableBanner: {
    backgroundColor: EPMAPS_COLORS.successBg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.successBorder,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    marginBottom: EPMAPS_SPACING.lg,
  },
  immutableBannerTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.success,
  },
  immutableBannerText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.successDark,
    lineHeight: 19,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
  },
  attentionBanner: {
    backgroundColor: EPMAPS_COLORS.attentionBg,
    borderWidth: 1.5,
    borderColor: EPMAPS_COLORS.attentionBorder,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    marginBottom: EPMAPS_SPACING.lg,
  },
  attentionBannerTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.attention,
  },
  attentionBannerText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.attentionDark,
    lineHeight: 19,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
  },
  card: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    marginBottom: EPMAPS_SPACING.lg,
  },
  cardCategoryLabel: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.xs,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.accentDark,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.md,
    paddingBottom: EPMAPS_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: EPMAPS_COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.lg,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.primaryDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: EPMAPS_SPACING.sm,
    paddingVertical: 5,
    borderRadius: EPMAPS_RADII.sm,
    borderWidth: 1,
  },
  statusBadgeIcon: {
    marginRight: 4,
  },
  badgePending: {
    backgroundColor: EPMAPS_COLORS.pendingSyncBg,
    borderColor: EPMAPS_COLORS.pendingSyncBorder,
  },
  badgeVerification: {
    backgroundColor: EPMAPS_COLORS.verificationBg,
    borderColor: EPMAPS_COLORS.verificationBorder,
  },
  badgeAttention: {
    backgroundColor: EPMAPS_COLORS.attentionBg,
    borderColor: EPMAPS_COLORS.attentionBorder,
  },
  badgeSubmitted: {
    backgroundColor: EPMAPS_COLORS.successBg,
    borderColor: EPMAPS_COLORS.successBorder,
  },
  statusBadgeText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.xs,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
  },
  badgeTextPending: {
    color: EPMAPS_COLORS.pendingSync,
  },
  badgeTextVerification: {
    color: EPMAPS_COLORS.verification,
  },
  badgeTextAttention: {
    color: EPMAPS_COLORS.attention,
  },
  badgeTextSubmitted: {
    color: EPMAPS_COLORS.success,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
  },
  dataValue: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.textDark,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: EPMAPS_SPACING.sm,
  },
  tabularValue: {
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
    color: EPMAPS_COLORS.primaryDark,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
  },
  anomalyText: {
    color: EPMAPS_COLORS.attention,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  divider: {
    height: 1,
    backgroundColor: EPMAPS_COLORS.borderLight,
    marginVertical: EPMAPS_SPACING.sm,
  },
  photoContainer: {
    marginTop: EPMAPS_SPACING.md,
    borderRadius: EPMAPS_RADII.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    backgroundColor: EPMAPS_COLORS.bgSecondary,
  },
  photo: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  noPhotoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EPMAPS_COLORS.bgLight,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    borderRadius: EPMAPS_RADII.md,
    padding: EPMAPS_SPACING.md,
    marginTop: EPMAPS_SPACING.md,
  },
  noPhotoIcon: {
    marginRight: EPMAPS_SPACING.sm,
  },
  noPhotoText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  actionButtonsContainer: {
    marginTop: EPMAPS_SPACING.xs,
    gap: EPMAPS_SPACING.md,
  },
  editButton: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.primary,
    borderRadius: EPMAPS_RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: EPMAPS_SPACING.lg,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
  },
  deleteButton: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.dangerSoftBg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.dangerSoftBorder,
    borderRadius: EPMAPS_RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: EPMAPS_SPACING.lg,
  },
  deleteButtonText: {
    color: EPMAPS_COLORS.danger,
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: EPMAPS_SPACING.xxl,
  },
  loadingText: {
    marginTop: EPMAPS_SPACING.md,
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
  },
  errorCard: {
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderRadius: EPMAPS_RADII.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.dangerBorder,
    padding: EPMAPS_SPACING.lg,
    marginTop: EPMAPS_SPACING.lg,
  },
  errorTitle: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.md,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.danger,
  },
  errorText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    color: EPMAPS_COLORS.dangerDark,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    lineHeight: 19,
  },
});
