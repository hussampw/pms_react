import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { useTenantsStore } from '../../stores/tenantsStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const UnitDetailScreen = ({ route, navigation }) => {
  const { unit } = route.params;
  const { user } = useAuthStore();
  const { deleteUnit, getUnitsByParent } = useUnitsStore();
  const { tenants } = useTenantsStore();
  const [subUnits, setSubUnits] = useState([]);
  
  const currentTenant = tenants.find(t => t.unit_id === unit.id && t.status === 'active');

  useEffect(() => {
    loadSubUnits();
  }, []);

  const loadSubUnits = async () => {
    const subs = await getUnitsByParent(unit.id, user?.uid || '');
    setSubUnits(subs);
  };

  const handleDelete = () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الوحدة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteUnit(unit.id, user?.uid || '');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>{unit.unit_name}</Text>
        {unit.address && <Text style={styles.address}>{unit.address}</Text>}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>النوع:</Text>
          <Text style={styles.value}>{unit.unit_type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>الحالة:</Text>
          <Text style={styles.value}>{unit.status}</Text>
        </View>

        {unit.rent_amount && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>الإيجار:</Text>
            <Text style={styles.value}>{unit.rent_amount} ر.ع</Text>
          </View>
        )}

        {unit.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.label}>الوصف:</Text>
            <Text style={styles.description}>{unit.description}</Text>
          </View>
        )}
      </Card>

      {currentTenant && (
        <Card>
          <Text style={styles.sectionTitle}>المستأجر الحالي</Text>
          <Text style={styles.tenantName}>{currentTenant.full_name}</Text>
          <Text style={styles.tenantPhone}>{currentTenant.phone}</Text>
        </Card>
      )}

      {subUnits.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>الوحدات الفرعية ({subUnits.length})</Text>
          {subUnits.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subUnitItem}
              onPress={() => navigation.push('UnitDetail', { unit: sub })}
            >
              <Text style={styles.subUnit}>• {sub.unit_name}</Text>
              <Text style={styles.subUnitArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="إضافة وحدة فرعية"
          onPress={() => navigation.navigate('AddUnit', { parentUnitId: unit.id })}
          variant="primary"
          style={styles.actionButton}
        />
        
        <Button
          title="إضافة مستأجر"
          onPress={() => navigation.navigate('AddTenant', { unitId: unit.id })}
          variant="success"
          style={styles.actionButton}
        />
        
        <Button
          title="حذف الوحدة"
          onPress={handleDelete}
          variant="danger"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  descriptionBox: {
    marginTop: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tenantName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  tenantPhone: {
    fontSize: 14,
    color: '#666',
  },
  subUnitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  subUnit: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  subUnitArrow: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 10,
  },
  actions: {
    marginVertical: 20,
  },
  actionButton: {
    marginBottom: 10,
  }
});