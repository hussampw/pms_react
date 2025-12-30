import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useExpensesStore } from '../../stores/expensesStore';
import { Card } from '../../components/Card';
import { format } from 'date-fns';

const ExpenseItem = ({ expense }) => {
  return (
    <Card>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseName}>{expense.expense_name}</Text>
          <Text style={styles.categoryName}>{expense.category_name}</Text>
          <Text style={styles.unitName}>{expense.unit_name}</Text>
        </View>
        <Text style={styles.amount}>{expense.expense_amount} ر.ع</Text>
      </View>

      <View style={styles.expenseFooter}>
        <Text style={styles.date}>
          {format(new Date(expense.expense_date), 'dd/MM/yyyy')}
        </Text>
      </View>

      {expense.notes && (
        <Text style={styles.notes}>{expense.notes}</Text>
      )}
    </Card>
  );
};

export const ExpensesScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { expenses, fetchExpenses } = useExpensesStore();

  useEffect(() => {
    if (user) {
      fetchExpenses(user.uid);
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        renderItem={({ item }) => <ExpenseItem expense={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد مصروفات</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  categoryName: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 2,
  },
  unitName: {
    fontSize: 12,
    color: '#666',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  expenseFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  notes: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
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
    backgroundColor: '#F44336',
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