import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { useAuthStore } from '../../stores/authStore';
import { useExpensesStore } from '../../stores/expensesStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addExpense, categories, fetchCategories } = useExpensesStore();
  const { units, fetchUnits } = useUnitsStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_id: '',
    expense_category_id: '',
    expense_name: '',
    expense_amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchUnits(user.uid);
      fetchCategories();
    }
  }, [user]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.unit_id || !formData.expense_category_id || !formData.expense_name || !formData.expense_amount) {
      Alert.alert('خطأ', 'الرجاء إدخال البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        ...formData,
        expense_amount: parseFloat(formData.expense_amount),
        expense_category_id: parseInt(formData.expense_category_id),
        unit_id: parseInt(formData.unit_id),
      }, user?.uid || '');

      Alert.alert('نجاح', 'تم إضافة المصروف بنجاح');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة المصروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.unit_id}
          onValueChange={(value) => updateField('unit_id', value)}
        >
          <TypedPicker.Item label="اختر الوحدة *" value="" />
          {units.map(unit => (
            <TypedPicker.Item
              key={unit.id}
              label={unit.unit_name}
              value={unit.id?.toString() || ''}
            />
          ))}
        </TypedPicker>
      </View>

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.expense_category_id}
          onValueChange={(value) => updateField('expense_category_id', value)}
        >
          <TypedPicker.Item label="اختر الفئة *" value="" />
          {categories.map(category => (
            <TypedPicker.Item
              key={category.id}
              label={category.category_name}
              value={category.id?.toString() || ''}
            />
          ))}
        </TypedPicker>
      </View>

      <Input
        label="اسم المصروف *"
        value={formData.expense_name}
        onChangeText={(value) => updateField('expense_name', value)}
        placeholder="مثال: صيانة السباكة"
      />

      <Input
        label="المبلغ (ر.ع) *"
        value={formData.expense_amount}
        onChangeText={(value) => updateField('expense_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Input
        label="التاريخ"
        value={formData.expense_date}
        onChangeText={(value) => updateField('expense_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="ملاحظات"
        value={formData.notes}
        onChangeText={(value) => updateField('notes', value)}
        placeholder="ملاحظات إضافية"
        multiline
        numberOfLines={3}
      />

      <Button
        title="إضافة المصروف"
        onPress={handleSubmit}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  }
});


