import React from 'react';
import { View as RNView , StyleSheet, ViewProps as RNViewProps, StyleProp, ViewStyle } from 'react-native';

interface ViewProps extends RNViewProps {
  children?: any;
  style?: StyleProp<ViewStyle>;
}

export const View= ({ children, style, ...props }: ViewProps) => {
    return (
        <RNView style={[styles.view, style]} {...props}>
            {children}
        </RNView>
    );
};

const styles = StyleSheet.create({
    view: {
        
    }
});