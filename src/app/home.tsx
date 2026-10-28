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
import { Ionicons } from '@expo/vector-icons';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { useSessionController } from '@/presentation/session/useSessionController';
import { useGlobalStatusController } from '@/presentation/session/useGlobalStatusController';
import { EPMAPS_COLORS, EPMAPS_RADII, EPMAPS_SPACING, EPMAPS_TOUCH } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { technician, logout } = useSessionController();
  const { isOnline, pendingCount, connectionLabel } = useGlobalStatusController();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const todayDate = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Perfil y Turno del Técnico */}
        <View style={styles.techCard}>
          <View style={styles.techCardHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={26} color={EPMAPS_COLORS.primaryDark} />
              </View>
              <View style={styles.avatarBadge}>
                <View style={styles.liveDot} />
              </View>
            </View>

            <View style={styles.techMainInfo}>
              <View style={styles.shiftBadge}>
                <View style={styles.shiftDot} />
                <Text style={styles.shiftBadgeText}>TURNO ACTIVO</Text>
              </View>
              <Text style={styles.techName} numberOfLines={1}>
                {technician?.name ?? 'Técnico de Campo'}
              </Text>
              <View style={styles.techMetaRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{technician?.employeeCode ?? 'TEC'}</Text>
                </View>
                <Text style={styles.roleText}>Cuadrilla Técnica · Zona Norte</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.techFooterRow}>
            <View style={styles.footerInfoItem}>
              <Ionicons name="calendar-outline" size={14} color={EPMAPS_COLORS.textMuted} />
              <Text style={styles.footerDateText}>
                {todayDate.charAt(0).toUpperCase() + todayDate.slice(1)}
              </Text>
            </View>
            <View style={styles.secureStorageBadge}>
              <Ionicons name="shield-checkmark" size={13} color={EPMAPS_COLORS.accentDark} />
              <Text style={styles.secureStorageText}>Persistencia Local Activa</Text>
            </View>
          </View>
        </View>

        {/* Resumen Operativo de la Jornada (KPIs) */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionHeader}>INDICADORES DE JORNADA</Text>
          <View style={styles.kpiGrid}>
            {/* KPI 1: Cola de Lecturas */}
            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => router.push('/reading-queue')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ver bandeja de lecturas pendientes"
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: EPMAPS_COLORS.bgBlue }]}>
                  <Ionicons name="document-text-outline" size={20} color={EPMAPS_COLORS.primaryDark} />
                </View>
                <Ionicons name="chevron-forward" size={16} color={EPMAPS_COLORS.textSubtle} />
              </View>
              <Text style={styles.kpiNumber}>{pendingCount}</Text>
              <Text style={styles.kpiTitle}>Lecturas en Cola</Text>
              <Text style={styles.kpiSub}>
                {pendingCount === 0 ? 'Sin envíos pendientes' : 'Por transmitir'}
              </Text>
            </TouchableOpacity>

            {/* KPI 2: Conectividad y Sincronización */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <View
                  style={[
                    styles.kpiIconBox,
                    {
                      backgroundColor: isOnline ? EPMAPS_COLORS.successBg : EPMAPS_COLORS.dangerBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={isOnline ? 'wifi' : 'cloud-offline-outline'}
                    size={20}
                    color={isOnline ? EPMAPS_COLORS.success : EPMAPS_COLORS.danger}
                  />
                </View>
                <View
                  style={[
                    styles.kpiStatusDot,
                    { backgroundColor: isOnline ? EPMAPS_COLORS.success : EPMAPS_COLORS.danger },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.kpiStatusText,
                  { color: isOnline ? EPMAPS_COLORS.success : EPMAPS_COLORS.danger },
                ]}
              >
                {connectionLabel}
              </Text>
              <Text style={styles.kpiTitle}>Enlace de Datos</Text>
              <Text style={styles.kpiSub}>
                {isOnline ? 'Envío desatendido listo' : 'Guardado offline seguro'}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones Operativas Principales */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeader}>ACCIONES PRINCIPALES</Text>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => router.push('/meter-search')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Buscar Medidor"
          >
            <View style={styles.actionIconCirclePrimary}>
              <Ionicons name="search" size={22} color={EPMAPS_COLORS.textInverse} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitlePrimary}>Buscar Medidor</Text>
              <Text style={styles.actionSubtextPrimary}>
                Consultar catastro en línea o memoria local MED-XXXXXX
              </Text>
            </View>
            <View style={styles.actionArrowCirclePrimary}>
              <Ionicons name="chevron-forward" size={18} color="#93C5FD" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => router.push('/reading-queue')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Bandeja de Lecturas"
          >
            <View style={styles.actionIconCircleSecondary}>
              <Ionicons name="file-tray-stacked-outline" size={22} color={EPMAPS_COLORS.primaryDark} />
            </View>
            <View style={styles.actionTextCol}>
              <View style={styles.actionTitleRow}>
                <Text style={styles.actionTitleSecondary}>Bandeja de Lecturas</Text>
                {pendingCount > 0 ? (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterBadgeText}>{pendingCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.actionSubtextSecondary}>
                Revisión de capturas y verificación diferida
              </Text>
            </View>
            <View style={styles.actionArrowCircleSecondary}>
              <Ionicons name="chevron-forward" size={18} color={EPMAPS_COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Garantía Institucional Offline & Cierre de Turno */}
        <View style={styles.footerSection}>
          <View style={styles.offlineGuaranteeBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={EPMAPS_COLORS.primaryDark} style={styles.guaranteeIcon} />
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>Operación 100% Offline-First</Text>
              <Text style={styles.guaranteeBody}>
                Todas las capturas se resguardan de inmediato en el almacenamiento local antes de cualquier transmisión.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cerrar Turno"
          >
            <Ionicons name="log-out-outline" size={18} color={EPMAPS_COLORS.danger} style={styles.logoutIcon} />
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
    backgroundColor: EPMAPS_COLORS.bgLight,
  },
  container: {
    padding: EPMAPS_SPACING.lg,
    paddingBottom: EPMAPS_SPACING.xxl,
  },
  // Tarjeta del Técnico
  techCard: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: EPMAPS_SPACING.lg,
  },
  techCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: EPMAPS_SPACING.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: EPMAPS_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: EPMAPS_COLORS.success,
  },
  techMainInfo: {
    flex: 1,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: EPMAPS_COLORS.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: EPMAPS_RADII.full,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.successBorder,
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: EPMAPS_COLORS.success,
    marginRight: 5,
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: EPMAPS_COLORS.success,
    letterSpacing: 0.5,
  },
  techName: {
    fontSize: 19,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    lineHeight: 24,
  },
  techMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  codeBadge: {
    backgroundColor: EPMAPS_COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderMedium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: EPMAPS_RADII.sm,
    marginRight: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: EPMAPS_COLORS.textDark,
  },
  roleText: {
    fontSize: 12,
    color: EPMAPS_COLORS.textMuted,
  },
  cardDivider: {
    height: 1,
    backgroundColor: EPMAPS_COLORS.borderLight,
    marginVertical: EPMAPS_SPACING.md,
  },
  techFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerDateText: {
    fontSize: 11.5,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: '500',
  },
  secureStorageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: EPMAPS_RADII.sm,
  },
  secureStorageText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: EPMAPS_COLORS.accentDark,
  },
  // Sección de KPIs
  kpiSection: {
    marginBottom: EPMAPS_SPACING.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: EPMAPS_COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: EPMAPS_SPACING.sm,
    marginLeft: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: EPMAPS_SPACING.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.md,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: EPMAPS_COLORS.primaryDark,
    lineHeight: 26,
  },
  kpiStatusText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 26,
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: EPMAPS_COLORS.textDark,
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10.5,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 1,
  },
  // Acciones Principales
  actionSection: {
    marginBottom: EPMAPS_SPACING.lg,
  },
  primaryActionButton: {
    minHeight: 74,
    backgroundColor: EPMAPS_COLORS.primaryDark,
    borderRadius: EPMAPS_RADII.lg,
    paddingHorizontal: EPMAPS_SPACING.lg,
    paddingVertical: EPMAPS_SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  actionIconCirclePrimary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EPMAPS_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EPMAPS_SPACING.md,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitlePrimary: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 16.5,
    fontWeight: '700',
  },
  actionSubtextPrimary: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  actionArrowCirclePrimary: {
    marginLeft: 8,
  },
  secondaryActionButton: {
    minHeight: 74,
    backgroundColor: EPMAPS_COLORS.surface,
    borderWidth: 1.2,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.lg,
    paddingHorizontal: EPMAPS_SPACING.lg,
    paddingVertical: EPMAPS_SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconCircleSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EPMAPS_COLORS.bgBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EPMAPS_SPACING.md,
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionTitleSecondary: {
    color: EPMAPS_COLORS.primaryDark,
    fontSize: 16.5,
    fontWeight: '700',
  },
  counterBadge: {
    backgroundColor: EPMAPS_COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: EPMAPS_RADII.full,
  },
  counterBadgeText: {
    color: EPMAPS_COLORS.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
  actionSubtextSecondary: {
    color: EPMAPS_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actionArrowCircleSecondary: {
    marginLeft: 8,
  },
  // Pie de Pantalla
  footerSection: {
    marginTop: EPMAPS_SPACING.xs,
  },
  offlineGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    borderRadius: EPMAPS_RADII.md,
    padding: EPMAPS_SPACING.md,
    marginBottom: EPMAPS_SPACING.md,
  },
  guaranteeIcon: {
    marginRight: EPMAPS_SPACING.sm,
    marginTop: 1,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: EPMAPS_COLORS.primaryDark,
  },
  guaranteeBody: {
    fontSize: 11,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  logoutButton: {
    minHeight: EPMAPS_TOUCH.minHeight,
    backgroundColor: EPMAPS_COLORS.dangerSoftBg,
    borderWidth: 1.2,
    borderColor: EPMAPS_COLORS.dangerSoftBorder,
    borderRadius: EPMAPS_RADII.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: EPMAPS_SPACING.lg,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: EPMAPS_COLORS.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});


