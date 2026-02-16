import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, type TextStyle } from 'react-native';
import { titani, fontSizes, fontWeights } from '@/config/theme';
import { calculateCountdown, formatCountdown } from '@/lib/time/countdown';

interface CountdownTimerProps {
  targetDate: Date;
  style?: TextStyle;
  onExpire?: () => void;
}

export function CountdownTimer({ targetDate, style, onExpire }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calculateCountdown(targetDate);
      setCountdown(next);
      if (next.isExpired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  return (
    <Text style={[styles.text, countdown.isExpired && styles.expired, style]}>
      {formatCountdown(countdown)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: titani.text,
  },
  expired: {
    color: titani.error,
  },
});
