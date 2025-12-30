import React, { useEffect, useState } from 'react';
import {  ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useUnitsStore } from '../stores/unitsStore';
import { usePaymentsStore } from '../stores/paymentsStore';
import { useObligationsStore } from '../stores/obligationsStore';
import {  StatCard, Card, View, Text } from '../components/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { units, fetchUnits } = useUnitsStore();
  const { fetchPayments, getPaymentStats } = usePaymentsStore();
  const { obligations, fetchObligations } = useObligationsStore();
  const [stats, setStats] = useState({ total_income: 0, total_expenses: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (user) {
      fetchUnits(user.uid);
      fetchPayments(user.uid);
      fetchObligations(user.uid);
      const paymentStats = await getPaymentStats(user.uid);
      setStats(paymentStats);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);
  const { t } = useTranslation();
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const rentedUnits = units.filter(u => u.status === 'rented').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const netProfit = stats.total_income - stats.total_expenses;
  const dueObligations = obligations.filter(o => 
    new Date(o.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
   <SafeAreaView>
     <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('welcome')}, {user?.username}</Text>
        <Text style={styles.subtitle}>{t('general_view')}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard 
          title={t('total_units')}
          value={units.length}
          subtitle={`${rentedUnits} ${t('rented')}`}
        />
        <StatCard 
          title={t('net_profit')}
          value={`${netProfit.toFixed(0)} ${t('OMR')}`}
          color={netProfit >= 0 ? '#4CAF50' : '#F44336'}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard 
          title={t('income')}
          value={`${stats.total_income?.toFixed(0) || 0} ${t('OMR')}`}
          color="#4CAF50"
        />
        <StatCard 
          title={t('expenses')}
          value={`${stats.total_expenses?.toFixed(0) || 0} ${t('OMR')}`}
          color="#F44336"
        />
      </View>

      {dueObligations.length > 0 && (
        <Card    style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ {t('due_obligations')}</Text>
          <Text style={styles.alertText}>
            {t('you_have')} {dueObligations.length} {t('due_obligations_next_week')}
          </Text>
        </Card>
      )}

      {vacantUnits > 0 && (
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 {t('you_have')} {vacantUnits} {t('vacant_units_available')}
          </Text>
        </Card>
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  alertCard: {
    margin: 15,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 5,
  },
  alertText: {
    color: '#E65100',
  },
  infoCard: {
    margin: 15,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    color: '#1565C0',
  }
});