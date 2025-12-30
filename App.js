import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/config/database';
import { notificationService } from './src/services/notificationService';
import './src/config/i18n';
export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Only initialize database on native platforms (not web)
        if (Platform.OS !== 'web') {
          await initDatabase();
          console.log('Database initialized');
        } else {
          console.log('Database initialization skipped on web');
        }
        
        // Only request notification permissions on native platforms
        if (Platform.OS !== 'web') {
          const granted = await notificationService.requestPermissions();
          if (granted) {
            console.log('Notifications enabled');
          }
        }
        setAppReady(true);

      } catch (error) {
        console.error('Initialization failed:', error);
        setError(error.message);
        setAppReady(true); 
        console.error('Initialization failed:', error);
      }
    };

    init();
  }, []);
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="auto" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>{t('please_restart_the_app')}</Text>
      </View>
    );
  }
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});