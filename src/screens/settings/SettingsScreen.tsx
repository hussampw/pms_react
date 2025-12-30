import React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { View } from '../../components/View';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from 'react-i18next';

import { initDatabase } from '../../config/database';
import { useLanguageStore } from '../../stores/languageStore';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
];
export const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { currentLanguage, changeLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const handleLogout = async () => {
    Alert.alert(
    t('logout'),
    t('logout_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };
  const handleLanguageChange = async (langCode: 'en' | 'ar' | 'fa') => {
    await changeLanguage(langCode);
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.nativeName : code;
  };
  const handleResetDatabase = () => {
    Alert.alert(
      t('reset_database'),
      t('reset_database_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await initDatabase();
              Alert.alert(t('success'), t('reset_database_success'));
            } catch (error) {
              Alert.alert(t('error'), t('reset_database_error'));
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <Text style={styles.currentLanguageLabel}>
            {t('current_language')}: {getLanguageName(currentLanguage)}
          </Text>
          <View style={styles.languageButtons}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  currentLanguage === lang.code && styles.languageButtonActive
                ]}
                onPress={() => handleLanguageChange(lang.code as 'en' | 'ar' | 'fa')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    currentLanguage === lang.code && styles.languageButtonTextActive
                  ]}
                >
                  {lang.nativeName}
                </Text>
                {currentLanguage === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>
      <Card style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account_information')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('email')}:</Text>
            <Text style={styles.infoValue}>{user?.email || t('not_available')}</Text>
          </View>
          {user?.username && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('username')}:</Text>
              <Text style={styles.infoValue}>{user.username}</Text>
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('database')}</Text>
          <Button
            title={t('reset_database')}
            onPress={handleResetDatabase}
            variant="danger"
            style={styles.button}
          />
          <Text style={styles.warningText}>
            {t('warning')}: {t('reset_database_warning')}
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          <Button
            title={t('logout')}
            onPress={handleLogout}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>إدارة الممتلكات</Text>
        <Text style={styles.footerText}>الإصدار 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  currentLanguageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  languageButtons: {
    gap: 10,
  },
  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  languageButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    margin: 15,
    marginTop: 0,
  },
  section: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  }
});


