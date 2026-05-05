import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import SwipeableCard from './src/SwipeableCard';
import { sampleCards } from './src/sampleData';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom', 'top']}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.cardSection}>
          <SwipeableCard cards={sampleCards} showFeedbackCard />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Intent-Aware Swipeable Card</Text>
          <Text style={[styles.paragraph, { textAlign: 'center' }]}>
            Multi-Parameter Gesture-Driven Swipeable Logic
          </Text>
          <Text style={styles.subtitle}>Tryout Intro</Text>
          <Text style={styles.paragraph}>
            Straight left / straight right (slide angle roughly 0–30° from horizontal) counts as a horizontal swipe
            and moves to the next card when you release past the threshold.
          </Text>
          <Text style={styles.paragraph}>
            Straight up / straight down (roughly 60–90°) is treated as vertical intent — the pager does not latch,
            so scrolling stays comfortable.
          </Text>
          <Text style={styles.paragraph}>
            Diagonal drags around 30–60° sit in a grey zone — you may see the gesture stay undecided until you
            move further, then the card springs back if it does not cross the swipe threshold.
          </Text>
          <Text style={styles.paragraph}>
            Note: Swiping to the left or right will both advance to the next card.
          </Text>
          <Text style={styles.subtitle}>Quick checks</Text>
          <Text style={styles.listItem}>- Fast swipe right → should advance</Text>
          <Text style={styles.listItem}>- Fast swipe left → should advance</Text>
          <Text style={styles.listItem}>- Pure vertical drag → card should not page away</Text>
          <Text style={styles.listItem}>- ~45° diagonal → often bounces without advancing</Text>
          <Text style={styles.paragraph}>
            Replace the images under assets/cards/ (card-1.png … card-6.png) — keep the filenames so requires() stay valid.
          </Text>
          <Text style={styles.subtitle}>Credits</Text>
          <Text style={styles.listItem}>@WennnO on GitHub: https://github.com/WennnO</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 32,
  },
  cardSection: {
    alignItems: 'center',
  },
  textBlock: {
    marginTop: 60,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  listItem: {
    fontSize: 14,
    color: '#444',
  },
});
