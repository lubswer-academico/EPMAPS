import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGlobalStatusController } from '@/presentation/session/useGlobalStatusController';
import {
  EPMAPS_COLORS,
  EPMAPS_RADII,
  EPMAPS_SPACING,
  EPMAPS_TOUCH,
  EPMAPS_TYPOGRAPHY,
} from '@/constants/theme';

/**
 * Barra de estado global persistente y visible en la cabecera operativa.
 * Muestra el indicador de conectividad ("Con señal" / "Sin señal")
 * y el contador de lecturas pendientes de sincronización con contraste para exteriores.
 */
export function GlobalStatusBar() {
  const { isOnline, connectionLabel, pendingLabel } = useGlobalStatusController();

  return (
    <View
      style={[
        styles.container,
        isOnline ? styles.onlineBackground : styles.offlineBackground,
      ]}
      testID="global-status-bar"
    >
      {/* Sección Izquierda: Píldora de Conectividad */}
      <View
        style={[
          styles.statusPill,
          isOnline ? styles.statusPillOnline : styles.statusPillOffline,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            isOnline ? styles.dotOnline : styles.dotOffline,
          ]}
        />
        <Text
          style={[
            styles.statusText,
            isOnline ? styles.statusTextOnline : styles.statusTextOffline,
          ]}
        >
          {connectionLabel}
        </Text>
      </View>

      {/* Centro: Logotipo Institucional */}
      <View style={styles.brandSection}>
        <Text style={styles.brandText}>EPMAPS</Text>
      </View>

      {/* Sección Derecha: Píldora de Pendientes */}
      <View style={styles.pendingPill}>
        <Text style={styles.pendingText}>{pendingLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: EPMAPS_TOUCH.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EPMAPS_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: EPMAPS_COLORS.borderLight,
    backgroundColor: EPMAPS_COLORS.surface,
  },
  onlineBackground: {
    backgroundColor: EPMAPS_COLORS.surface,
  },
  offlineBackground: {
    backgroundColor: EPMAPS_COLORS.dangerSoftBg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: EPMAPS_RADII.full,
    borderWidth: 1,
  },
  statusPillOnline: {
    backgroundColor: EPMAPS_COLORS.successBg,
    borderColor: EPMAPS_COLORS.successBorder,
  },
  statusPillOffline: {
    backgroundColor: EPMAPS_COLORS.dangerBg,
    borderColor: EPMAPS_COLORS.dangerBorder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: EPMAPS_COLORS.success,
  },
  dotOffline: {
    backgroundColor: EPMAPS_COLORS.danger,
  },
  statusText: {
    fontSize: 12,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
  },
  statusTextOnline: {
    color: EPMAPS_COLORS.success,
  },
  statusTextOffline: {
    color: EPMAPS_COLORS.danger,
  },
  brandSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: EPMAPS_TYPOGRAPHY.sizes.sm,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.extrabold,
    color: EPMAPS_COLORS.primaryDark,
    letterSpacing: 1.2,
  },
  pendingPill: {
    backgroundColor: EPMAPS_COLORS.bgBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: EPMAPS_RADII.full,
    borderWidth: 1,
    borderColor: EPMAPS_COLORS.borderLight,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: EPMAPS_TYPOGRAPHY.weights.bold,
    color: EPMAPS_COLORS.primaryDark,
    fontVariant: EPMAPS_TYPOGRAPHY.tabularNums,
  },
});

