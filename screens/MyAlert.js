// MyAlert.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyAlert = ({ type, message, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.alert, type === 'success' ? styles.success : styles.error]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    position: 'absolute',
    top: 20,
    left: '10%',
    right: '10%',
    borderRadius: 8,
    padding: 10,
    zIndex: 1000,
  },
  success: {
    backgroundColor: 'black',
  },
  error: {
    backgroundColor: '#303030',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MyAlert;
