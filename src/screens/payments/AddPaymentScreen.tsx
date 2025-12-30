import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { useTenantsStore } from '../../stores/tenantsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddPaymentScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addPayment } = usePaymentsStore();
  const { units, fetchUnits } = useUnitsStore();
  const { tenants, fetchTenants } = useTenantsStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    unit_id: '',
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'rent',
    payment_method: 'cash',
    payment_direction: 'incoming',
    tenant_id: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      fetchUnits(user.uid);
      fetchTenants(user.uid);
    }
  }, [user]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.unit_id || !formData.payment_amount) {
      Alert.alert('خطأ', 'الرجاء إدخال البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await addPayment({
        ...formData,
        payment_amount: parseFloat(formData.payment_amount),
        tenant_id: formData.tenant_id || null,
      }, user?.uid || '');
      
      Alert.alert('نجاح', 'تم إضافة المدفوع بنجاح');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة المدفوع');
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.unit_id === parseInt(formData.unit_id) && t.status === 'active'
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.unit_id}
          onValueChange={(value) => updateField('unit_id', value)}
        >
          <TypedPicker.Item label="اختر الوحدة" value="" />
          {units.map(unit => (
            <TypedPicker.Item 
              key={unit.id} 
              label={unit.unit_name} 
              value={unit.id?.toString() || ''} 
            />
          ))}
        </TypedPicker>
      </View>

      {filteredTenants.length > 0 && (
        <View style={styles.pickerContainer}>
          <TypedPicker
            selectedValue={formData.tenant_id}
            onValueChange={(value) => updateField('tenant_id', value)}
          >
            <TypedPicker.Item label="اختر المستأجر (اختياري)" value="" />
            {filteredTenants.map(tenant => (
              <TypedPicker.Item 
                key={tenant.id} 
                label={tenant.full_name} 
                value={tenant.id?.toString() || ''} 
              />
            ))}
          </TypedPicker>
        </View>
      )}

      <Input
        label="المبلغ (ر.ع) *"
        value={formData.payment_amount}
        onChangeText={(value) => updateField('payment_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Input
        label="التاريخ"
        value={formData.payment_date}
        onChangeText={(value) => updateField('payment_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_direction}
          onValueChange={(value) => updateField('payment_direction', value)}
        >
          <TypedPicker.Item label="وارد (دخل)" value="incoming" />
          <TypedPicker.Item label="صادر (مصروف)" value="outgoing" />
        </TypedPicker>
      </View>

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_type}
          onValueChange={(value) => updateField('payment_type', value)}
        >
          <TypedPicker.Item label="إيجار" value="rent" />
          <TypedPicker.Item label="تأمين" value="deposit" />
          <TypedPicker.Item label="صيانة" value="maintenance" />
          <TypedPicker.Item label="فواتير" value="bills" />
          <TypedPicker.Item label="أخرى" value="other" />
        </TypedPicker>
      </View>

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_method}
          onValueChange={(value) => updateField('payment_method', value)}
        >
          <TypedPicker.Item label="نقدي" value="cash" />
          <TypedPicker.Item label="تحويل بنكي" value="bank" />
          <TypedPicker.Item label="بطاقة" value="card" />
        </TypedPicker>
      </View>

      <Input
        label="ملاحظات"
        value={formData.notes}
        onChangeText={(value) => updateField('notes', value)}
        placeholder="ملاحظات إضافية"
        multiline
        numberOfLines={3}
      />

      <Button
        title="إضافة المدفوع"
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
