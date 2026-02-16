import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Input } from './Input';
import { titani, spacing, fontSizes } from '@/config/theme';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(function PhoneInput(
  { value, onChangeText, label, error },
  ref,
) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+45</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Input
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder="12 34 56 78"
            keyboardType="phone-pad"
            maxLength={11}
            error={error}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: titani.text,
    marginBottom: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prefix: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: titani.input.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    justifyContent: 'center',
    height: 48,
  },
  prefixText: {
    fontSize: fontSizes.base,
    color: titani.textSecondary,
    fontWeight: '500',
  },
  inputWrapper: {
    flex: 1,
  },
});
