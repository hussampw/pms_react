import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading, error } = useAuthStore();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    const success = await register(email, password, username);
    if (success) {
      navigation.replace('Main');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>
        
        <Input
          label="اسم المستخدم"
          value={username}
          onChangeText={setUsername}
          placeholder="اسم المستخدم"
        />
        
        <Input
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        
        <Input
          label="تأكيد كلمة المرور"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <Button 
          title="إنشاء الحساب" 
          onPress={handleRegister}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
  }
});
