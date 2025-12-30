import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text , Input , Button } from '../../components/index';
import { useAuthStore } from '../../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const { t } = useTranslation();
  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      navigation.replace('Main');
    }
  };

  return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Use 'padding' for iOS, 'height' for Android
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10} 
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('login')}</Text>
        
        <Input
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('email_placeholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label={t('password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('password_placeholder')}
          secureTextEntry
        />
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <Button 
          title={t('login')} 
          onPress={handleLogin}
          loading={loading}
        />
        
        <Button 
          title={t('register')} 
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
          style={styles.registerButton}
        />
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 10,
  }
});
