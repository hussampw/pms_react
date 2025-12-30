import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text } from './index';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button = ({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  disabled = false,
  style 
}: ButtonProps) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    backgroundColor: '#757575',
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  danger: {
    backgroundColor: '#F44336',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
