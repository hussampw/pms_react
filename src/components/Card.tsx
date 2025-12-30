import React from 'react';
import {  StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { View } from './index';

interface CardProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, onPress, style }: CardProps & { children?: any }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
});
