import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUnitsStore } from '../../stores/unitsStore';
import { Card } from '../../components/Card';
import { SafeAreaView } from 'react-native-safe-area-context';

const UnitTypeIcon = {
  building: '🏢',
  apartment: '🏠',
  floor: '🏗️',
  room: '🚪',
  shop: '🏪',
};

const StatusBadge = ({ status }) => {
  const colors = {
    vacant: '#4CAF50',
    rented: '#2196F3',
    maintenance: '#FF9800',
  };
  
  const labels = {
    vacant: 'شاغر',
    rented: 'مؤجر',
    maintenance: 'صيانة',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[status] }]}>
      <Text style={styles.badgeText}>{labels[status]}</Text>
    </View>
  );
};

export const UnitsListScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { units, fetchUnits } = useUnitsStore();

  useEffect(() => {
    if (user) {
      fetchUnits(user.uid);
    }
  }, [user]);

  // Build hierarchical structure
  const hierarchicalUnits = useMemo(() => {
    const buildTree = (parentId = null, level = 0) => {
      return units
        .filter(unit => unit.parent_id === parentId)
        .map(unit => ({
          ...unit,
          level,
          children: buildTree(unit.id, level + 1)
        }));
    };
    
    const tree = buildTree();
    
    // Flatten tree for FlatList
    const flatten = (items) => {
      const result = [];
      items.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          result.push(...flatten(item.children));
        }
      });
      return result;
    };
    
    return flatten(tree);
  }, [units]);

  const renderUnit = ({ item }) => {
    const indent = item.level * 20;
    const hasChildren = units.some(u => u.parent_id === item.id);
    
    return (
      <Card 
        onPress={() => navigation.navigate('UnitDetail', { unit: item })}
        style={[item.level > 0 && styles.subUnitCard]}
      >
        <View style={[styles.unitHeader, { paddingLeft: indent }]}>
          <View style={styles.unitInfo}>
            <Text style={styles.unitIcon}>{UnitTypeIcon[item.unit_type]}</Text>
            <View style={styles.unitTextContainer}>
              {item.level > 0 && (
                <Text style={styles.parentIndicator}>└─ </Text>
              )}
              <View>
                <Text style={styles.unitName}>{item.unit_name}</Text>
                {item.address && (
                  <Text style={styles.unitAddress}>{item.address}</Text>
                )}
                {item.parent_id && (
                  <Text style={styles.parentUnitText}>
                    تحت: {units.find(u => u.id === item.parent_id)?.unit_name || 'غير معروف'}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        {item.rent_amount > 0 && (
          <View style={[styles.rentInfo, { paddingLeft: indent }]}>
            <Text style={styles.rentLabel}>الإيجار:</Text>
            <Text style={styles.rentAmount}>{item.rent_amount} ر.ع</Text>
          </View>
        )}
        
        {hasChildren && (
          <View style={[styles.childrenIndicator, { paddingLeft: indent }]}>
            <Text style={styles.childrenText}>
              {units.filter(u => u.parent_id === item.id).length} وحدة فرعية
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={hierarchicalUnits}
        renderItem={renderUnit}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد وحدات</Text>
            <Text style={styles.emptySubtext}>ابدأ بإضافة وحدتك الأولى</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddUnit')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  parentIndicator: {
    fontSize: 16,
    color: '#999',
    marginRight: 5,
  },
  unitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  unitAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  parentUnitText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  subUnitCard: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  childrenIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  childrenText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
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
  rentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rentLabel: {
    color: '#666',
  },
  rentAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: 16,
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
    backgroundColor: '#2196F3',
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