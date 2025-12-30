import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { useAuthStore } from '../../stores/authStore';
import { useTenantsStore } from '../../stores/tenantsStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddTenantScreen = ({ route, navigation }: any) => {
  const { unitId } = route?.params || {};
  const { user } = useAuthStore();
  const { addTenant } = useTenantsStore();
  const { units, fetchUnits } = useUnitsStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    unit_id: unitId || '',
    full_name: '',
    national_id: '',
    phone: '',
    start_date: new Date().toISOString().split('T')[0],
    rent_amount: '',
    deposit_amount: '',
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
    if (!formData.full_name || !formData.rent_amount || !formData.unit_id) {
      Alert.alert('خطأ', 'الرجاء إدخال الاسم والإيجار والوحدة');
      return;
    }

    setLoading(true);
    try {
      await addTenant({
        ...formData,
        rent_amount: parseFloat(formData.rent_amount),
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      }, user?.uid || '');
      
      Alert.alert('نجاح', 'تم إضافة المستأجر بنجاح');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة المستأجر');
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

      <Input
        label="الاسم الكامل *"
        value={formData.full_name}
        onChangeText={(value) => updateField('full_name', value)}
        placeholder="الاسم الكامل"
      />

      <Input
        label="الرقم الوطني"
        value={formData.national_id}
        onChangeText={(value) => updateField('national_id', value)}
        placeholder="12345678"
      />

      <Input
        label="رقم الهاتف"
        value={formData.phone}
        onChangeText={(value) => updateField('phone', value)}
        placeholder="96512345678"
        keyboardType="phone-pad"
      />

      <Input
        label="تاريخ البداية"
        value={formData.start_date}
        onChangeText={(value) => updateField('start_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="قيمة الإيجار (ر.ع) *"
        value={formData.rent_amount}
        onChangeText={(value) => updateField('rent_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Input
        label="التأمين (ر.ع)"
        value={formData.deposit_amount}
        onChangeText={(value) => updateField('deposit_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Button
        title="إضافة المستأجر"
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
