import React, { useRef, useState } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Button } from '@/components/ui/Button';
import { titani, spacing } from '@/config/theme';

interface RulesCarouselProps {
  children: React.ReactNode[];
  onComplete: () => void;
  nextLabel: string;
  doneLabel: string;
}

export function RulesCarousel({ children, onComplete, nextLabel, doneLabel }: RulesCarouselProps) {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPages = children.length;
  const isLast = currentIndex === totalPages - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={children}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => `rule-${i}`}
        renderItem={({ item }) => (
          <View style={[styles.page, { width: width - spacing[8] }]}>{item}</View>
        )}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (width - spacing[8]));
          setCurrentIndex(idx);
        }}
        contentContainerStyle={styles.list}
        snapToInterval={width - spacing[8]}
        decelerationRate="fast"
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isLast ? doneLabel : nextLabel}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing[4],
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginVertical: spacing[4],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: titani.input.border,
  },
  dotActive: {
    backgroundColor: titani.navy,
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
});
