// components/RNText.tsx
import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
interface TextProps extends RNTextProps {
  bold?: boolean;  // Make optional with ?
  italic?: boolean;  // Make optional with ?
  // children is already optional from TextProps
}

export const Text = ({
  children,
  style,
  bold,
  italic,
  ...props
}: TextProps) => {
  const textStyles = [
    styles.default,
    bold && styles.bold,
    italic && styles.italic,
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
     {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  default: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
});
