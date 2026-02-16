import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, Pattern } from 'react-native-svg';
import { titani } from '@/config/theme';

export function HeightDiagram() {
  return (
    <View style={styles.container}>
      <Svg width={280} height={200} viewBox="0 0 280 200">
        {/* Ground / sidewalk */}
        <Rect x={0} y={170} width={280} height={30} fill="#E2E8F0" />
        <SvgText x={140} y={190} textAnchor="middle" fontSize={11} fill={titani.textSecondary}>
          Fortov / Vejbane
        </SvgText>

        {/* Light pole */}
        <Rect x={60} y={30} width={6} height={140} fill={titani.slate} rx={2} />

        {/* 2.3m height line */}
        <Line x1={30} y1={78} x2={100} y2={78} stroke={titani.success} strokeWidth={2} strokeDasharray="5,3" />
        <SvgText x={105} y={82} fontSize={12} fontWeight="bold" fill={titani.success}>
          Min. 2,3m
        </SvgText>

        {/* Poster at correct height */}
        <Rect x={72} y={50} width={30} height={40} fill="#DBEAFE" stroke={titani.navy} strokeWidth={1.5} rx={2} />
        <SvgText x={87} y={74} textAnchor="middle" fontSize={8} fill={titani.navy}>
          ✓
        </SvgText>

        {/* Road distance */}
        <Line x1={140} y1={160} x2={140} y2={170} stroke={titani.warning} strokeWidth={1.5} />
        <Line x1={200} y1={160} x2={200} y2={170} stroke={titani.warning} strokeWidth={1.5} />
        <Line x1={140} y1={165} x2={200} y2={165} stroke={titani.warning} strokeWidth={1.5} />
        <SvgText x={170} y={158} textAnchor="middle" fontSize={10} fill="#B45309">
          0,5m fra vej
        </SvgText>

        {/* Height measurement arrow */}
        <Line x1={45} y1={78} x2={45} y2={170} stroke={titani.slate} strokeWidth={1} strokeDasharray="3,3" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
