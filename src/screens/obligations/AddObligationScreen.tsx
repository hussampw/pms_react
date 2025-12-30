import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';

// Type assertion for Picker component
const TypedPicker = Picker as any;
import { useAuthStore } from '../../stores/authStore';
import { useObligationsStore } from '../../stores/obligationsStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const AddObligationScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addObligation } = useObligationsStore();
  const { units, fetchUnits } = useUnitsStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    unit_id: '',
    obligation_type: 'rent',
    payee_name: '',
    payee_phone: '',
    amount: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    next_due_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchUnits(user.uid);
    }
  }, [user]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.unit_id || !formData.payee_name || !formData.amount) {
      Alert.alert('خطأ', 'الرجاء إدخال البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await addObligation({
        ...formData,
        amount: parseFloat(formData.amount),
      }, user?.uid || '');

      Alert.alert('نجاح', 'تم إضافة الالتزام بنجاح');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة الالتزام');
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
          selectedValue={formData.obligation_type}
          onValueChange={(value) => updateField('obligation_type', value)}
        >
          <TypedPicker.Item label="إيجار" value="rent" />
          <TypedPicker.Item label="قسط شراء" value="installment" />
          <TypedPicker.Item label="رهن عقاري" value="mortgage" />
          <TypedPicker.Item label="رسوم جمعية" value="association_fee" />
          <TypedPicker.Item label="تأمين" value="insurance" />
        </TypedPicker>
      </View>

      <Input
        label="اسم المستفيد *"
        value={formData.payee_name}
        onChangeText={(value) => updateField('payee_name', value)}
        placeholder="الشخص أو الجهة المستفيدة"
      />

      <Input
        label="هاتف المستفيد"
        value={formData.payee_phone}
        onChangeText={(value) => updateField('payee_phone', value)}
        placeholder="96512345678"
        keyboardType="phone-pad"
      />

      <Input
        label="المبلغ (ر.ع) *"
        value={formData.amount}
        onChangeText={(value) => updateField('amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.frequency}
          onValueChange={(value) => updateField('frequency', value)}
        >
          <TypedPicker.Item label="شهري" value="monthly" />
          <TypedPicker.Item label="ربع سنوي" value="quarterly" />
          <TypedPicker.Item label="نصف سنوي" value="semi_annual" />
          <TypedPicker.Item label="سنوي" value="annual" />
        </TypedPicker>
      </View>

      <Input
        label="تاريخ البداية"
        value={formData.start_date}
        onChangeText={(value) => updateField('start_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="تاريخ الاستحقاق التالي"
        value={formData.next_due_date}
        onChangeText={(value) => updateField('next_due_date', value)}
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
        title="إضافة الالتزام"
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
