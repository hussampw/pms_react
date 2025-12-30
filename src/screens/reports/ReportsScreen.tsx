import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import { useExpensesStore } from '../../stores/expensesStore';

export const ReportsScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { getPaymentStats } = usePaymentsStore();
  const { getExpenseStats } = useExpensesStore();
  const [paymentStats, setPaymentStats] = useState({ total_income: 0, total_expenses: 0 });
  const [expenseStats, setExpenseStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const payments = await getPaymentStats(user.uid);
      setPaymentStats(payments);

      const expenses = await getExpenseStats(
        user.uid,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );
      setExpenseStats(expenses);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const netProfit = paymentStats.total_income - paymentStats.total_expenses;
  const totalExpenses = expenseStats.reduce((sum, stat) => sum + (stat.total || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التقارير المالية</Text>
        <Text style={styles.subtitle}>نظرة عامة على الأداء المالي</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="إجمالي الدخل"
          value={`${paymentStats.total_income?.toFixed(0) || 0} ر.ع`}
          color="#4CAF50"
        />
        <StatCard
          title="إجمالي المدفوعات"
          value={`${paymentStats.total_expenses?.toFixed(0) || 0} ر.ع`}
          color="#F44336"
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="صافي الربح"
          value={`${netProfit.toFixed(0)} ر.ع`}
          color={netProfit >= 0 ? '#4CAF50' : '#F44336'}
        />
        <StatCard
          title="إجمالي المصروفات"
          value={`${totalExpenses.toFixed(0)} ر.ع`}
          color="#FF9800"
        />
      </View>

      {expenseStats.length > 0 && (
        <Card style={styles.categoryCard}>
          <Text style={styles.cardTitle}>المصروفات حسب الفئة</Text>
          {expenseStats.map((stat, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{stat.category_name}</Text>
              <Text style={styles.categoryAmount}>{stat.total?.toFixed(0) || 0} ر.ع</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
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
  categoryCard: {
    margin: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  }
});


