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
import {
  EPMAPS_COLORS,
  EPMAPS_RADII,
  EPMAPS_SPACING,
  EPMAPS_TOUCH,
  EPMAPS_TYPOGRAPHY,
} from '@/constants/theme';

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
          </View>
        </View>

        {/* Resumen Operativo de la Jornada (KPIs Unificados sin iconos en cajas) */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionHeader}>Indicadores de jornada</Text>
          <View style={styles.kpiStrip}>
            {/* KPI 1: Cola de Lecturas */}
            <TouchableOpacity
              style={styles.kpiCell}
              onPress={() => router.push('/reading-queue')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ver bandeja de lecturas pendientes"
            >
              <View style={styles.kpiLabelRow}>
                <Text style={styles.kpiLabel}>Lecturas en cola</Text>
                <Ionicons name="chevron-forward" size={14} color={EPMAPS_COLORS.textMuted} />
              </View>
              <Text style={styles.kpiNumber}>{pendingCount}</Text>
              <Text style={styles.kpiSub}>
                {pendingCount === 0 ? 'Sin envíos pendientes' : 'Por transmitir'}
              </Text>
            </TouchableOpacity>

            <View style={styles.kpiVerticalDivider} />

            {/* KPI 2: Conectividad y Sincronización */}
            <View style={styles.kpiCell}>
              <View style={styles.kpiLabelRow}>
                <Text style={styles.kpiLabel}>Enlace de datos</Text>
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
              <Text style={styles.kpiSub}>
                {isOnline ? 'Envío desatendido listo' : 'Guardado offline seguro'}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones Operativas Principales */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeader}>Acciones principales</Text>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => router.push('/meter-search')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Buscar Medidor"
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={EPMAPS_COLORS.primaryDark}
              style={styles.actionLeadIcon}
            />
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitlePrimary}>Buscar Medidor</Text>
              <Text style={styles.actionSubtextPrimary}>
                Consultar datos e historial por código MED-XXXXXX
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={EPMAPS_COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => router.push('/reading-queue')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Bandeja de Lecturas"
          >
            <Ionicons
              name="file-tray-stacked-outline"
              size={22}
              color={EPMAPS_COLORS.primaryDark}
              style={styles.actionLeadIcon}
            />
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
            <Ionicons name="chevron-forward" size={18} color={EPMAPS_COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Cierre de Turno */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cerrar Turno"
          >
            <Ionicons name="log-out-outline" size={18} color={EPMAPS_COLORS.textInverse} style={styles.logoutIcon} />
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
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: EPMAPS_SPACING.lg,
    paddingTop: EPMAPS_SPACING.xl,
    paddingBottom: EPMAPS_SPACING.xxl,
  },
  // Tarjeta del Técnico
  techCard: {
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    padding: EPMAPS_SPACING.xl,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    marginBottom: EPMAPS_SPACING.xl,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EPMAPS_COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderMedium,
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
  techName: {
    fontSize: 19,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
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
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.textDark,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  roleText: {
    fontSize: 12.5,
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
    fontSize: 12,
    color: EPMAPS_COLORS.textMuted,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.medium,
  },
  // Sección de KPIs Unificada (app-screens §5: one container split by 1px divider, label above value)
  kpiSection: {
    marginBottom: EPMAPS_SPACING.xl,
  },
  sectionHeader: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.semibold,
    color: EPMAPS_COLORS.textMuted,
    marginBottom: EPMAPS_SPACING.md,
    marginLeft: 2,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: EPMAPS_COLORS.surface,
    borderRadius: EPMAPS_RADII.lg,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
    overflow: 'hidden',
  },
  kpiCell: {
    flex: 1,
    padding: EPMAPS_SPACING.xl,
  },
  kpiVerticalDivider: {
    width: 1,
    backgroundColor: EPMAPS_COLORS.borderLight,
  },
  kpiLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.medium,
    color: EPMAPS_COLORS.textMuted,
  },
  kpiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  kpiNumber: {
    fontSize: 30,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primaryDark,
    lineHeight: 34,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  kpiStatusText: {
    fontSize: 19,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    lineHeight: 34,
  },
  kpiSub: {
    fontSize: 12.5,
    color: EPMAPS_COLORS.textMuted,
    marginTop: 6,
  },
  // Acciones Principales
  actionSection: {
    marginBottom: EPMAPS_SPACING.xl,
  },
  primaryActionButton: {
    minHeight: 76,
    backgroundColor: EPMAPS_COLORS.surface,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.lg,
    paddingHorizontal: EPMAPS_SPACING.lg,
    paddingVertical: EPMAPS_SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EPMAPS_SPACING.md,
  },
  actionLeadIcon: {
    marginRight: EPMAPS_SPACING.md,
  },
  actionTextCol: {
    flex: 1,
    marginRight: EPMAPS_SPACING.sm,
  },
  actionTitlePrimary: {
    color: EPMAPS_COLORS.primaryDark,
    fontSize: 16,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
  actionSubtextPrimary: {
    color: EPMAPS_COLORS.textMuted,
    fontSize: 12.5,
    marginTop: 3,
  },
  secondaryActionButton: {
    minHeight: 76,
    backgroundColor: EPMAPS_COLORS.surface,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderMedium,
    borderRadius: EPMAPS_RADII.lg,
    paddingHorizontal: EPMAPS_SPACING.lg,
    paddingVertical: EPMAPS_SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionTitleSecondary: {
    color: EPMAPS_COLORS.primaryDark,
    fontSize: 16,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
  counterBadge: {
    backgroundColor: EPMAPS_COLORS.bgBlue,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.bgBlueBorder,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: EPMAPS_RADII.full,
  },
  counterBadgeText: {
    color: EPMAPS_COLORS.accentDark,
    fontSize: 11,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
  actionSubtextSecondary: {
    color: EPMAPS_COLORS.textMuted,
    fontSize: 12.5,
    marginTop: 3,
  },
  // Pie de Pantalla
  footerSection: {
    marginTop: EPMAPS_SPACING.sm,
  },
  logoutButton: {
    minHeight: EPMAPS_TOUCH.buttonHeight,
    backgroundColor: EPMAPS_COLORS.primaryDark,
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
    color: EPMAPS_COLORS.textInverse,
    fontSize: 15,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
});


