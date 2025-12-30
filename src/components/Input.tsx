import React from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps } from 'react-native';
import { View, Text } from './index';
import { useTranslation } from 'react-i18next';
interface InputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}
export const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  error,
  ...props 
}: InputProps) => {
const { t } = useTranslation();

  return (
 <View style={styles.container}> {label && <Text style={styles.label}>{t(label)}</Text>}
 <RNTextInput
   style={[styles.input, error && styles.inputError]}
   value={value}
   onChangeText={onChangeText}
   placeholder={t(placeholder)}
   placeholderTextColor="#999"
   {...props}
 />
 {error && <Text style={styles.errorText}>{t(error)}</Text>}</View>
     
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  }
});
