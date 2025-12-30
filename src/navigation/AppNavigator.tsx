import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { UnitsListScreen } from '../screens/units/UnitsListScreen';
import { UnitDetailScreen } from '../screens/units/UnitDetailScreen';
import { AddUnitScreen } from '../screens/units/AddUnitScreen';
import { PaymentsScreen } from '../screens/payments/PaymentsScreen';
import { AddPaymentScreen } from '../screens/payments/AddPaymentScreen';
import { AddTenantScreen } from '../screens/tenants/AddTenantScreen';
import { TenantsListScreen } from '../screens/tenants/TenantsListScreen';
import { ObligationsScreen } from '../screens/obligations/ObligationsScreen';
import { AddObligationScreen } from '../screens/obligations/AddObligationScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { View } from '../components/View';
import { Text } from '../components/Text';
import { ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          tabBarLabel: t('dashboard'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>
        }}
      />
      <Tab.Screen 
        name="Units" 
        component={UnitsListScreen}
        options={{ 
          tabBarLabel: t('units'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏢</Text>
        }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ 
          tabBarLabel: t('payments'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💰</Text>
        }}
      />
      <Tab.Screen 
        name="Obligations" 
        component={ObligationsScreen}
        options={{ 
          tabBarLabel: t('obligations'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ 
          tabBarLabel: t('more'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>☰</Text>
        }}
      />
    </Tab.Navigator>
  );
};

const MoreStackNavigator = createNativeStackNavigator();

const MoreStack = () => {
  const { t } = useTranslation();

  return (
    <MoreStackNavigator.Navigator id="MoreStackNavigator">
      <MoreStackNavigator.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen}
        options={{ title: t('more') }}
      />
      <MoreStackNavigator.Screen 
        name="Tenants" 
        component={TenantsListScreen}
        options={{ title: t('tenants') }}
      />
      <MoreStackNavigator.Screen 
        name="Expenses" 
        component={ExpensesScreen}
        options={{ title: t('expenses') }}
      />
      <MoreStackNavigator.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: t('reports') }}
      />
      <MoreStackNavigator.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: t('settings') }}
      />
    </MoreStackNavigator.Navigator>
  );
};

const MoreMenuScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const menuItems = [
    { title: t('tenants'), icon: '👥', screen: 'Tenants' },
    { title: t('expenses'), icon: '💸', screen: 'Expenses' },
    { title: t('reports'), icon: '📊', screen: 'Reports' },
    { title: t('settings'), icon: '⚙️', screen: 'Settings' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={{ padding: 15 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 12,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 32, marginRight: 15 }}>{item.icon}</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const AppNavigator = () => {
  const { user, login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { t , ready } = useTranslation();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        // User is already authenticated, just set the user in store
        // Don't call login with empty password - user is already logged in
        let userData = {};
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data() || {};
          }
        } catch (error: any) {
          // If Firestore is offline or document doesn't exist, continue with basic user info
          console.warn('Could not load user data from Firestore (offline or document missing):', error.message);
          // User can still use the app with basic info from auth
        }
        
        useAuthStore.setState({ 
          user: { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email,
            ...userData
          }, 
          loading: false 
        });
      } else {
        useAuthStore.setState({ user: null, loading: false });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading  || !ready) {
    return      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <Text style={{ fontSize: 18, color: '#666' }}>Loading...</Text>
  </View>
  }

  return (
    <NavigationContainer children={
      <Stack.Navigator id="StackNavigator">
        {!user ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: t('register') }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="UnitDetail" 
              component={UnitDetailScreen}
              options={{ title: t('unit_details') }}
            />
            <Stack.Screen 
              name="AddUnit" 
              component={AddUnitScreen}
              options={{ title: t('add_unit') }}
            />
            <Stack.Screen 
              name="AddPayment" 
              component={AddPaymentScreen}
              options={{ title: t('add_payment') }}
            />
            <Stack.Screen 
              name="Tenants" 
              component={TenantsListScreen}
              options={{ title: t('tenants') }}
            />
            <Stack.Screen 
              name="AddTenant" 
              component={AddTenantScreen}
              options={{ title: t('add_tenant') }}
            />
            <Stack.Screen 
              name="AddObligation" 
              component={AddObligationScreen}
              options={{ title: t('add_obligation') }}
            />
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen}
              options={{ title: t('add_expense') }}
            />
          </>
        )}
      </Stack.Navigator>
    } />
  );
};