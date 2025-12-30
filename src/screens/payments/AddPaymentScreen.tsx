import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View } from '../../components/View';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentsStore } from '../../stores/paymentsStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { useTenantsStore } from '../../stores/tenantsStore';
import { Input ,Button} from '../../components';
import { useTranslation } from 'react-i18next';
// Type assertion for Picker component
const TypedPicker = Picker as any;

export const AddPaymentScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addPayment } = usePaymentsStore();
  const { units, fetchUnits } = useUnitsStore();
  const { tenants, fetchTenants } = useTenantsStore();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
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
      Alert.alert(t('error'), t('please_enter_required_data'));
      return;
    }

    setLoading(true);
    try {
      await addPayment({
        ...formData,
        payment_amount: parseFloat(formData.payment_amount),
        tenant_id: formData.tenant_id || null,
      }, user?.uid || '');
      
      Alert.alert(t('success'), t('payment_added_successfully'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), t('payment_add_failed'));
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
          <TypedPicker.Item label={t('select_unit')} value="" />
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
            <TypedPicker.Item label={t('select_tenant_optional')} value="" />
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
        label={t('payment_amount') + " (ر.ع) *"}
        value={formData.payment_amount}
        onChangeText={(value) => updateField('payment_amount', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Input
        label={t('payment_date')}
        value={formData.payment_date}
        onChangeText={(value) => updateField('payment_date', value)}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_direction}
          onValueChange={(value) => updateField('payment_direction', value)}
        >
          <TypedPicker.Item label={t('incoming')} value="incoming" />
          <TypedPicker.Item label={t('outgoing')} value="outgoing" />
        </TypedPicker>
      </View>

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_type}
          onValueChange={(value) => updateField('payment_type', value)}
        >
          <TypedPicker.Item label={t('rent')} value="rent" />
          <TypedPicker.Item label={t('deposit')} value="deposit" />
          <TypedPicker.Item label={t('maintenance')} value="maintenance" />
          <TypedPicker.Item label={t('bills')} value="bills" />
          <TypedPicker.Item label={t('other')} value="other" />
        </TypedPicker>
      </View>

      <View style={styles.pickerContainer}>
        <TypedPicker
          selectedValue={formData.payment_method}
          onValueChange={(value) => updateField('payment_method', value)}
        >
          <TypedPicker.Item label={t('cash')} value="cash" />
          <TypedPicker.Item label={t('bank_transfer')} value="bank" />
          <TypedPicker.Item label={t('card')} value="card" />
        </TypedPicker>
      </View>

      <Input
        label={t('notes')}
        value={formData.notes}
        onChangeText={(value) => updateField('notes', value)}
        placeholder={t('notes_placeholder')}
        multiline
        numberOfLines={3}
      />

      <Button
        title={t('add_payment')}
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
