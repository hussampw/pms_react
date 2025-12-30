import React, { useEffect } from 'react';
import {FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useObligationsStore } from '../../stores/obligationsStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import { format, addMonths, parseISO } from 'date-fns';
import { View, Text , Card } from '../../components/index';
import { SafeAreaView } from 'react-native-safe-area-context';

const ObligationItem = ({ obligation, onPay }) => {
  const dueDate = parseISO(obligation.next_due_date);
  const isOverdue = dueDate < new Date();
  const isDueSoon = dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const frequencyLabels = {
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    semi_annual: 'نصف سنوي',
    annual: 'سنوي',
  };

  const typeLabels = {
    rent: 'إيجار',
    installment: 'قسط',
    mortgage: 'رهن عقاري',
    association_fee: 'رسوم جمعية',
    insurance: 'تأمين',
  };

  return (
    <Card style={[
      styles.obligationCard,
      isOverdue && styles.overdueCard,
      isDueSoon && !isOverdue && styles.dueSoonCard
    ]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.unitName}>{obligation.unit_name}</Text>
          <Text style={styles.obligationType}>
            {typeLabels[obligation.obligation_type]} - {frequencyLabels[obligation.frequency]}
          </Text>
        </View>
        <Text style={styles.amount}>{obligation.amount} ر.ع</Text>
      </View>

      <View style={styles.payeeInfo}>
        <Text style={styles.label}>المستفيد:</Text>
        <Text style={styles.value}>{obligation.payee_name}</Text>
      </View>

      <View style={styles.dateInfo}>
        <Text style={styles.label}>الاستحقاق التالي:</Text>
        <Text style={[
          styles.dueDate,
          isOverdue && styles.overdueText,
          isDueSoon && !isOverdue && styles.dueSoonText
        ]}>
          {format(dueDate, 'dd/MM/yyyy')}
        </Text>
      </View>

      {isOverdue && (
        <Text style={styles.overdueLabel}>⚠️ متأخر</Text>
      )}
      {isDueSoon && !isOverdue && (
        <Text style={styles.dueSoonLabel}>⏰ مستحق قريباً</Text>
      )}

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => onPay(obligation)}
      >
        <Text style={styles.payButtonText}>دفع الآن</Text>
      </TouchableOpacity>
    </Card>
  );
};

export const ObligationsScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { obligations, fetchObligations, updateNextDueDate } = useObligationsStore();
  const { addPayment } = usePaymentsStore();

  useEffect(() => {
    if (user) {
      fetchObligations(user.uid);
    }
  }, [user]);

  const calculateNextDueDate = (currentDate, frequency) => {
    const date = parseISO(currentDate);
    switch (frequency) {
      case 'monthly':
        return addMonths(date, 1).toISOString().split('T')[0];
      case 'quarterly':
        return addMonths(date, 3).toISOString().split('T')[0];
      case 'semi_annual':
        return addMonths(date, 6).toISOString().split('T')[0];
      case 'annual':
        return addMonths(date, 12).toISOString().split('T')[0];
      default:
        return addMonths(date, 1).toISOString().split('T')[0];
    }
  };

  const handlePay = async (obligation) => {
    Alert.alert(
      'تأكيد الدفع',
      `هل تريد تسجيل دفعة ${obligation.amount} ر.ع لـ ${obligation.payee_name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'دفع',
          onPress: async () => {
            try {
              await addPayment({
                unit_id: obligation.unit_id,
                payment_amount: obligation.amount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_type: obligation.obligation_type,
                payment_method: 'bank',
                payment_direction: 'outgoing',
                obligation_id: obligation.id,
                payee_name: obligation.payee_name,
              }, user?.uid || '');

              const nextDate = calculateNextDueDate(
                obligation.next_due_date,
                obligation.frequency
              );
              await updateNextDueDate(obligation.id, nextDate, user?.uid || '');

              Alert.alert('نجاح', 'تم تسجيل الدفع وتحديث تاريخ الاستحقاق');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في تسجيل الدفع');
            }
          }
        }
      ]
    );
  };

  const sortedObligations = [...obligations].sort((a, b) => 
    new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedObligations}
        renderItem={({ item }) => (
          <ObligationItem obligation={item} onPay={handlePay} />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد التزامات</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddObligation')}
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
  obligationCard: {
    marginBottom: 15,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  dueSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  obligationType: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  payeeInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dateInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginRight: 5,
  },
  value: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  dueDate: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  overdueText: {
    color: '#F44336',
  },
  dueSoonText: {
    color: '#FF9800',
  },
  overdueLabel: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dueSoonLabel: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#2196F3',
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