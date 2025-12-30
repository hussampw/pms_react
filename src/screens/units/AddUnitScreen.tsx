import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { useAuthStore } from '../../stores/authStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddUnitScreen = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const { addUnit, units, fetchUnits } = useUnitsStore();
  const [loading, setLoading] = useState(false);
  const parentUnitId = route?.params?.parentUnitId;
  
  const [formData, setFormData] = useState({
    unit_name: '',
    unit_type: 'apartment',
    description: '',
    address: '',
    is_rentable: true,
    rent_amount: '',
    status: 'vacant',
    parent_id: parentUnitId || null,
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
    if (!formData.unit_name) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم الوحدة');
      return;
    }

    setLoading(true);
    try {
      await addUnit({
        ...formData,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        parent_id: formData.parent_id || null,
      }, user?.uid || '');
      
      Alert.alert('نجاح', 'تم إضافة الوحدة بنجاح');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة الوحدة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="اسم الوحدة *"
        value={formData.unit_name}
        onChangeText={(value) => updateField('unit_name', value)}
        placeholder="مثال: شقة 101"
      />

      <Text style={styles.pickerLabel}>الوحدة الأم (اختياري)</Text>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.parent_id || ''}
          onValueChange={(value) => updateField('parent_id', value || null)}
        >
          <TypedPicker.Item label="لا يوجد (وحدة رئيسية)" value="" />
          {units
            .filter(unit => !unit.parent_id) // Only show top-level units as parents
            .map(unit => (
              <TypedPicker.Item 
                key={unit.id} 
                label={unit.unit_name} 
                value={unit.id} 
              />
            ))}
        </TypedPicker>
      </View>

      <Text style={styles.pickerLabel}>نوع الوحدة</Text>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.unit_type}
          onValueChange={(value) => updateField('unit_type', value)}
        >
          <TypedPicker.Item label="شقة" value="apartment" />
          <TypedPicker.Item label="مبنى" value="building" />
          <TypedPicker.Item label="طابق" value="floor" />
          <TypedPicker.Item label="غرفة" value="room" />
          <TypedPicker.Item label="محل" value="shop" />
        </TypedPicker>
      </View>

      <Input
        label="العنوان"
        value={formData.address}
        onChangeText={(value) => updateField('address', value)}
        placeholder="العنوان الكامل"
        multiline
      />

      <Input
        label="الوصف"
        value={formData.description}
        onChangeText={(value) => updateField('description', value)}
        placeholder="وصف الوحدة"
        multiline
        numberOfLines={3}
      />

      <Input
        label="قيمة الإيجار (ر.ع)"
        value={formData.rent_amount}
        onChangeText={(value) => updateField('rent_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Button
        title="إضافة الوحدة"
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
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  }
});
