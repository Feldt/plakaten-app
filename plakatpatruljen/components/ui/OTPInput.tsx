import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { titani, spacing, fontSizes } from '@/config/theme';

interface OTPInputProps {
  onComplete: (code: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const CODE_LENGTH = 6;

export function OTPInput({ onComplete, error = false, disabled = false }: OTPInputProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setCode('');
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [error, shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);

    if (digits.length === CODE_LENGTH) {
      onComplete(digits);
    }
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.wrapper}>
      <Animated.View style={[styles.container, shakeStyle]}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.box,
              index === code.length && styles.boxFocused,
              code[index] ? styles.boxFilled : null,
              error ? styles.boxError : null,
              disabled ? styles.boxDisabled : null,
            ]}
          >
            <Text style={styles.digit}>{code[index] ?? ''}</Text>
          </View>
        ))}
      </Animated.View>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        editable={!disabled}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={styles.hiddenInput}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginVertical: spacing[6],
  },
  box: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: titani.input.border,
    borderRadius: titani.input.radius,
    backgroundColor: titani.input.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderWidth: 2,
    borderColor: titani.navy,
  },
  boxFilled: {
    borderColor: titani.navy,
  },
  boxError: {
    borderColor: titani.input.errorBorder,
  },
  boxDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.6,
  },
  digit: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: titani.text,
    textAlign: 'center',
  },
  wrapper: {
    position: 'relative',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
});
