import React, { useEffect } from 'react';
import {  StyleSheet, TouchableOpacity } from 'react-native';
import { View , Text,FlatList } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import { Card } from '../../components/Card';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
const PaymentItem = ({ payment }) => {
  const isIncoming = payment.payment_direction === 'incoming';
  return (
    <Card>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.unitName}>{payment.unit_name}</Text>
          {payment.tenant_name && (
            <Text style={styles.tenantName}>{payment.tenant_name}</Text>
          )}
        </View>
        <Text style={[
          styles.amount,
          { color: isIncoming ? '#4CAF50' : '#F44336' }
        ]}>
          {isIncoming ? '+' : '-'}{payment.payment_amount} ر.ع
        </Text>
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={styles.date}>
          {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
        </Text>
        {payment.payment_method && (
          <Text style={styles.method}>{payment.payment_method}</Text>
        )}
      </View>
    </Card>
  );
};

export const PaymentsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { payments, fetchPayments } = usePaymentsStore();

  useEffect(() => {
    if (user) {
      fetchPayments(user.uid);
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={payments}
        renderItem={({ item }) => <PaymentItem payment={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('no_payments')}</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPayment')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tenantName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  method: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  }
});
