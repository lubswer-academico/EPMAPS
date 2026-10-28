import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGlobalStatusController } from '@/presentation/session/useGlobalStatusController';

/**
 * Barra de estado global persistente y visible en la cabecera operativa.
 * Muestra el indicador de conectividad ("Con señal" / "Sin señal")
 * y el contador de lecturas pendientes de sincronización.
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
      <View style={styles.section}>
        <View
          style={[
            styles.statusDot,
            isOnline ? styles.dotOnline : styles.dotOffline,
          ]}
        />
        <Text style={styles.statusText}>{connectionLabel}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.pendingText}>{pendingLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  onlineBackground: {
    backgroundColor: '#E8F5E9',
  },
  offlineBackground: {
    backgroundColor: '#FFEBEE',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotOnline: {
    backgroundColor: '#2E7D32',
  },
  dotOffline: {
    backgroundColor: '#C62828',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
});
