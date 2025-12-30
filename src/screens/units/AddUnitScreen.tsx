import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { useAuthStore } from '../../stores/authStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTranslation } from 'react-i18next';

// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddUnitScreen = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const { addUnit, units, fetchUnits } = useUnitsStore();
  const [loading, setLoading] = useState(false);
  const parentUnitId = route?.params?.parentUnitId;
  const { t } = useTranslation();
  
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
      Alert.alert(t('error'), t('please_enter_unit_name'));
      return;
    }

    setLoading(true);
    try {
      await addUnit({
        ...formData,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        parent_id: formData.parent_id || null,
      }, user?.uid || '');
      
      Alert.alert(t('success'), t('unit_added_successfully'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), t('failed_to_add_unit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label={t('unit_name') + ' *'}
        value={formData.unit_name}
        onChangeText={(value) => updateField('unit_name', value)}
        placeholder={t('unit_name_placeholder')}
      />

      <Text style={styles.pickerLabel}>{t('parent_unit_optional')}</Text>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.parent_id || ''}
          onValueChange={(value) => updateField('parent_id', value || null)}
        >
          <TypedPicker.Item label={t('no_parent_unit')} value="" />
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

      <Text style={styles.pickerLabel}>{t('unit_type')}</Text>
      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.unit_type}
          onValueChange={(value) => updateField('unit_type', value)}
        >
          <TypedPicker.Item label={t('apartment')} value="apartment" />
          <TypedPicker.Item label={t('building')} value="building" />
          <TypedPicker.Item label={t('floor')} value="floor" />
          <TypedPicker.Item label={t('room')} value="room" />
          <TypedPicker.Item label={t('shop')} value="shop" />
        </TypedPicker>
      </View>

      <Input
        label={t('address')}
        value={formData.address}
        onChangeText={(value) => updateField('address', value)}
        placeholder={t('address_placeholder')}
        multiline
      />

      <Input
        label={t('description')} 
        value={formData.description}
        onChangeText={(value) => updateField('description', value)}
        placeholder={t('description_placeholder')}
        multiline
        numberOfLines={3}
      />

      <Input
        label={t('rent_amount')}
        value={formData.rent_amount}
        onChangeText={(value) => updateField('rent_amount', value)}
        placeholder={t('rent_amount_placeholder')}
        keyboardType="decimal-pad"
      />

      <Button
        title={t('add_unit')}
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
