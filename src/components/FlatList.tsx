import React from 'react';
import { FlatList as RNFlatList , StyleSheet, FlatListProps as RNFlatListProps, StyleProp } from 'react-native';

interface FlatListProps extends RNFlatListProps<any> {
  children?: any;
}

export const FlatList= ({ children, style, ...props }: FlatListProps) => {
    return (
        <RNFlatList style={[styles.FlatList, style]} {...props}>
            {children}
        </RNFlatList>
    );
};

const styles = StyleSheet.create({
    FlatList: {
        
    }
});