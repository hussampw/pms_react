import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useTenantsStore } from '../../stores/tenantsStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: { [key: string]: string } = {
    active: '#4CAF50',
    inactive: '#999',
    ended: '#F44336',
  };
  
  const labels: { [key: string]: string } = {
    active: 'نشط',
    inactive: 'غير نشط',
    ended: 'منتهي',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[status] || '#999' }]}>
      <Text style={styles.badgeText}>{labels[status] || status}</Text>
    </View>
  );
};

const TenantItem = ({ tenant, navigation }: { tenant: any; navigation: any }) => {
  return (
    <Card>
      <View style={styles.tenantHeader}>
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>{tenant.full_name}</Text>
          {tenant.unit_name && (
            <Text style={styles.unitName}>الوحدة: {tenant.unit_name}</Text>
          )}
        </View>
        <StatusBadge status={tenant.status || 'active'} />
      </View>
      
      <View style={styles.tenantDetails}>
        {tenant.phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الهاتف:</Text>
            <Text style={styles.detailValue}>{tenant.phone}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>الإيجار:</Text>
          <Text style={styles.rentAmount}>{tenant.rent_amount} ر.ع</Text>
        </View>
        
        {tenant.start_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ البداية:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(tenant.start_date), 'dd/MM/yyyy')}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export const TenantsListScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { tenants, fetchTenants } = useTenantsStore();
  const { units, fetchUnits } = useUnitsStore();

  useEffect(() => {
    if (user) {
      fetchTenants(user.uid);
      fetchUnits(user.uid);
    }
  }, [user]);

  const handleAddTenant = () => {
    // If there are units, navigate to AddTenant with first unit as default
    // Otherwise, just navigate to AddTenant
    if (units.length > 0) {
      navigation.navigate('AddTenant', { unitId: units[0].id });
    } else {
      navigation.navigate('AddTenant');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tenants}
        renderItem={({ item }) => <TenantItem tenant={item} navigation={navigation} />}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا يوجد مستأجرون</Text>
            <Text style={styles.emptySubtext}>ابدأ بإضافة مستأجرك الأول</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTenant}
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
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unitName: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  tenantDetails: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  rentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
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

