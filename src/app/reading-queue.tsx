import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { GlobalStatusBar } from '@/components/GlobalStatusBar';
import { useReadingQueueController } from '@/presentation/readingQueue/useReadingQueueController';
import { useSyncEngine } from '@/presentation/sync/useSyncEngine';
import { useGlobalStatusController } from '@/presentation/session/useGlobalStatusController';
import { deleteConsolidatedReading } from '@/storage/reading/readingDraftStorage';
import { deletePhoto } from '@/services/photo/photoStorageService';
import { formatReadingStatusLabel } from '@/domain/readingQueue/queueRules';
import { ConsolidatedReading, QueueFilter } from '@/domain/reading/types';

export default function ReadingQueueScreen() {
  const router = useRouter();
  const { isOnline } = useGlobalStatusController();
  const {
    filteredReadings,
    filter,
    isLoading,
    setFilter,
    loadQueue,
  } = useReadingQueueController();

  const { isSyncing, syncSummary, syncError } = useSyncEngine(() => {
    loadQueue();
  });

  const handleDiscardReading = (item: ConsolidatedReading) => {
    Alert.alert(
      'Descartar lectura',
      `¿Desea descartar la lectura del medidor ${item.meterCode}? Se eliminará permanentemente del dispositivo y se borrará su fotografía.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.photoUri) {
                await deletePhoto(item.photoUri);
              }
              await deleteConsolidatedReading(item.id);
              await loadQueue();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo descartar la lectura.');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [loadQueue])
  );

  const getStatusBadgeStyle = (status: ConsolidatedReading['status']) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return styles.badgeVerification;
      case 'PENDING_SYNC':
        return styles.badgeSync;
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
        return styles.badgeTextSync;
      case 'REQUIRES_ATTENTION':
        return styles.badgeTextAttention;
      case 'SUBMITTED':
        return styles.badgeTextSubmitted;
    }
  };

  const renderReadingItem = ({ item }: { item: ConsolidatedReading }) => {
    const formattedDate = new Date(item.capturedAt).toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isNonNumeric = item.condition === 'Inaccesible';
    const readingSummary = isNonNumeric
      ? item.inaccessibilityReason || 'Inaccesible'
      : item.currentReading !== null && item.currentReading !== undefined
      ? `${item.currentReading} m³`
      : 'Sin lectura';

    const isRequiresAttention = item.status === 'REQUIRES_ATTENTION';

    return (
      <TouchableOpacity
        style={[styles.card, isRequiresAttention && styles.cardAttention]}
        onPress={() => {
          if (isRequiresAttention) {
            router.push({
              pathname: '/reading-wizard',
              params: {
                meterCode: item.meterCode,
                editingId: item.id,
              },
            });
          } else {
            router.push({ pathname: '/reading-detail', params: { id: item.id } });
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Medidor ${item.meterCode}, estado ${formatReadingStatusLabel(item.status)}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.meterCode}>{item.meterCode}</Text>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={[styles.statusBadgeText, getStatusTextStyle(item.status)]}>
              {formatReadingStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        {isRequiresAttention ? (
          <View style={styles.attentionNotice}>
            <Text style={styles.attentionNoticeText}>
              ⚠️ {item.requiresAttentionReason || 'Se detectó anomalía no confirmada o inconsistencia. Toque aquí para revisar o subsanar.'}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Condición:</Text>
            <Text style={styles.dataValue}>{item.condition}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Lectura / Motivo:</Text>
            <Text style={styles.dataValue}>{readingSummary}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Fecha de registro:</Text>
            <Text style={styles.dataValue}>{formattedDate}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Evidencia:</Text>
            <Text style={styles.dataValue}>
              {item.photoUri ? '📷 Con fotografía' : 'Sin foto'}
            </Text>
          </View>
        </View>

        {isRequiresAttention ? (
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.cardDiscardButton}
              onPress={() => handleDiscardReading(item)}
              accessibilityRole="button"
              accessibilityLabel={`Descartar lectura del medidor ${item.meterCode}`}
            >
              <Text style={styles.cardDiscardButtonText}>🗑️ Descartar lectura</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const filterTabs: Array<{ id: QueueFilter; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'submitted', label: 'Enviadas' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalStatusBar />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Regresar al inicio"
        >
          <Text style={styles.backButtonText}>← Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bandeja de Lecturas</Text>
        <Text style={styles.subtitle}>Registro de capturas del mes</Text>
      </View>

      {/* Indicador de Sincronización Automática en Segundo Plano & Avisos */}
      {isSyncing ? (
        <View style={styles.syncStatusBanner}>
          <ActivityIndicator size="small" color="#005C8A" />
          <Text style={styles.syncStatusText}>Sincronizando lecturas automáticamente con oficina...</Text>
        </View>
      ) : null}

      {!isOnline ? (
        <View style={styles.offlineNoticeContainer}>
          <Text style={styles.offlineNotice}>
            Modo sin conexión. La cola se enviará automáticamente al recuperar la señal.
          </Text>
        </View>
      ) : null}

      {syncError ? (
        <View style={styles.errorNotice}>
          <Text style={styles.errorNoticeText}>⚠️ {syncError}</Text>
        </View>
      ) : null}

      {syncSummary && !isSyncing && syncSummary.sent > 0 ? (
        <View style={styles.summaryNotice}>
          <Text style={styles.summaryNoticeText}>
            ✓ Sincronización automática: {syncSummary.sent} enviadas al sistema central.
          </Text>
        </View>
      ) : null}

      {/* Selector de Filtros */}
      <View style={styles.tabContainer}>
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setFilter(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filtro ${tab.label}`}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#005C8A" />
          <Text style={styles.loadingText}>Cargando bandeja de lecturas...</Text>
        </View>
      ) : filteredReadings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin lecturas registradas</Text>
          <Text style={styles.emptyText}>
            No existen lecturas en la memoria local para el filtro seleccionado.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReadings}
          keyExtractor={(item) => item.id}
          renderItem={renderReadingItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    marginBottom: 4,
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
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#005C8A',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  meterCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005C8A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeVerification: {
    backgroundColor: '#EDE7F6',
  },
  badgeSync: {
    backgroundColor: '#FFF8E1',
  },
  badgeAttention: {
    backgroundColor: '#FFF3E0',
  },
  badgeSubmitted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextVerification: {
    color: '#4527A0',
  },
  badgeTextSync: {
    color: '#F57F17',
  },
  badgeTextAttention: {
    color: '#E65100',
  },
  badgeTextSubmitted: {
    color: '#2E7D32',
  },
  syncStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    borderWidth: 1,
    borderColor: '#81D4FA',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  syncStatusText: {
    fontSize: 13,
    color: '#0277BD',
    fontWeight: '600',
  },
  offlineNoticeContainer: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  offlineNotice: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorNotice: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  errorNoticeText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
  },
  summaryNotice: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  summaryNoticeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  cardAttention: {
    borderColor: '#FF9800',
    borderWidth: 2,
    backgroundColor: '#FFFDE7',
  },
  attentionNotice: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  attentionNoticeText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '600',
  },
  cardBody: {
    gap: 4,
  },
  cardActionsRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    alignItems: 'flex-end',
  },
  cardDiscardButton: {
    minHeight: 48,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FFA39E',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDiscardButtonText: {
    fontSize: 13,
    color: '#CF1322',
    fontWeight: '700',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataLabel: {
    fontSize: 13,
    color: '#666666',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    flexShrink: 1,
    textAlign: 'right',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
});
