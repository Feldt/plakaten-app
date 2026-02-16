import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import { titani, spacing, fontSizes } from '@/config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, style, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={titani.input.placeholder}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: titani.text,
    marginBottom: spacing[1.5],
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: titani.input.border,
    borderRadius: titani.input.radius,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    fontSize: 15,
    color: titani.text,
    backgroundColor: titani.input.bg,
  },
  inputFocused: {
    borderColor: titani.input.focusBorder,
    borderWidth: 2,
  },
  inputError: {
    borderColor: titani.input.errorBorder,
  },
  error: {
    fontSize: fontSizes.xs,
    color: titani.error,
    marginTop: spacing[1],
  },
  hint: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: spacing[1],
  },
});
