import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/** Card surface is 3:4 (width : height, portrait). */
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3;

function getImageSource(card) {
  if (!card?.image) return null;
  if (typeof card.image === 'string') return { uri: card.image };
  return card.image;
}

export default function SwipeableCard({
  cards = [],
  showFeedbackCard = true,
  onCardSwipingChange,
}) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardSwiping, setIsCardSwiping] = useState(false);
  const totalCards = cards.length;

  useEffect(() => {
    onCardSwipingChange?.(isCardSwiping);
  }, [isCardSwiping, onCardSwipingChange]);

  const cardAnimations = useRef(
    cards.map(() => ({
      position: new Animated.ValueXY(),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const feedbackCardAnimation = useRef({
    position: new Animated.ValueXY(),
    rotation: new Animated.Value(0),
    opacity: new Animated.Value(1),
  }).current;

  const resetDeckAnimations = () => {
    cardAnimations.forEach((anim) => {
      anim.position.setValue({ x: 0, y: 0 });
      anim.rotation.setValue(0);
      anim.opacity.setValue(1);
    });
  };

  const getGestureIntent = (dx, dy) => {
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const distance = Math.hypot(adx, ady);
    if (distance < 8) return 'undecided';
    const angle = (Math.atan2(ady, adx) * 180) / Math.PI;
    if (angle <= 30) return 'horizontal';
    if (angle >= 60) return 'vertical';
    return 'undecided';
  };

  const runSwipeAway = (index, dx) => {
    const direction = dx > 0 ? 1 : -1;
    const exitX = direction * width * 1.5;
    const exitY = dx * 0.3;
    const nextIndex = showFeedbackCard ? Math.min(index + 1, totalCards) : (index + 1) % totalCards;

    Animated.parallel([
      Animated.timing(cardAnimations[index].position.x, { toValue: exitX, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardAnimations[index].position.y, { toValue: exitY, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardAnimations[index].rotation, { toValue: direction * 25, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardAnimations[index].opacity, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      if (nextIndex < totalCards) {
        cardAnimations[nextIndex].position.setValue({ x: 0, y: 0 });
        cardAnimations[nextIndex].rotation.setValue(0);
        cardAnimations[nextIndex].opacity.setValue(1);
      } else {
        feedbackCardAnimation.position.setValue({ x: 0, y: 0 });
        feedbackCardAnimation.rotation.setValue(0);
        feedbackCardAnimation.opacity.setValue(1);
      }
      setCurrentCardIndex(nextIndex);
      setIsCardSwiping(false);
    });
  };

  const createPanResponder = (index) => {
    if (index !== currentCardIndex || totalCards === 0) return null;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const intent = getGestureIntent(gestureState.dx, gestureState.dy);
        if (intent === 'horizontal') {
          setIsCardSwiping(true);
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        setIsCardSwiping(true);
        cardAnimations[index].position.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        cardAnimations[index].position.x.setValue(gestureState.dx);
        cardAnimations[index].position.y.setValue(gestureState.dy);
        cardAnimations[index].rotation.setValue(gestureState.dx / 15);
      },
      onPanResponderRelease: (_, gestureState) => {
        cardAnimations[index].position.flattenOffset();
        const shouldSwipe = Math.abs(gestureState.dx) > width * 0.1 || Math.abs(gestureState.vx) > 0.2;
        if (shouldSwipe) {
          runSwipeAway(index, gestureState.dx);
          return;
        }
        Animated.parallel([
          Animated.spring(cardAnimations[index].position.x, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
          Animated.spring(cardAnimations[index].position.y, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
          Animated.spring(cardAnimations[index].rotation, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
        ]).start(() => setIsCardSwiping(false));
      },
    });
  };

  const feedbackPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => getGestureIntent(gestureState.dx, gestureState.dy) === 'horizontal',
      onPanResponderGrant: () => {
        setIsCardSwiping(true);
        feedbackCardAnimation.position.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        feedbackCardAnimation.position.x.setValue(gestureState.dx);
        feedbackCardAnimation.position.y.setValue(gestureState.dy);
        feedbackCardAnimation.rotation.setValue(gestureState.dx / 15);
      },
      onPanResponderRelease: (_, gestureState) => {
        feedbackCardAnimation.position.flattenOffset();
        const shouldSwipe = Math.abs(gestureState.dx) > width * 0.1 || Math.abs(gestureState.vx) > 0.2;
        if (!shouldSwipe) {
          Animated.parallel([
            Animated.spring(feedbackCardAnimation.position.x, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
            Animated.spring(feedbackCardAnimation.position.y, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
            Animated.spring(feedbackCardAnimation.rotation, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
          ]).start(() => setIsCardSwiping(false));
          return;
        }
        const direction = gestureState.dx > 0 ? 1 : -1;
        Animated.parallel([
          Animated.timing(feedbackCardAnimation.position.x, { toValue: direction * width * 1.5, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(feedbackCardAnimation.position.y, { toValue: gestureState.dx * 0.3, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(feedbackCardAnimation.rotation, { toValue: direction * 25, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(feedbackCardAnimation.opacity, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start(() => {
          resetDeckAnimations();
          setCurrentCardIndex(0);
          setIsCardSwiping(false);
          feedbackCardAnimation.position.setValue({ x: 0, y: 0 });
          feedbackCardAnimation.rotation.setValue(0);
          feedbackCardAnimation.opacity.setValue(1);
        });
      },
    });
  }, [totalCards]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardsContainer}>
        {cards.map((card, index) => {
          const isTopCard = index === currentCardIndex && index < totalCards;
          const panResponder = isTopCard ? createPanResponder(index) : null;
          const relativeIndex = (index - currentCardIndex + cards.length) % cards.length;
          const transforms = [
            { translateX: cardAnimations[index].position.x },
            { translateY: cardAnimations[index].position.y },
            {
              rotate: cardAnimations[index].rotation.interpolate({
                inputRange: [-100, 0, 100],
                outputRange: ['-10deg', '0deg', '10deg'],
              }),
            },
          ];

          if (relativeIndex > 0 && relativeIndex <= 3) {
            transforms.push({ scale: 1 - relativeIndex * 0.05 });
            transforms.push({ translateY: relativeIndex * 10 });
          }

          const source = getImageSource(card);

          return (
            <Animated.View
              key={String(card.id ?? index)}
              style={[
                styles.cardFace,
                {
                  transform: transforms,
                  opacity: cardAnimations[index].opacity,
                  zIndex: cards.length - Math.abs(index - currentCardIndex),
                  pointerEvents: isTopCard ? 'auto' : 'none',
                },
              ]}
              {...(panResponder?.panHandlers || {})}
            >
              {source ? (
                <Image source={source} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.placeholderItem]}>
                  <Ionicons name="image-outline" size={28} color="#ccc" />
                </View>
              )}
            </Animated.View>
          );
        })}

        {showFeedbackCard && currentCardIndex >= totalCards && (
          <Animated.View
            style={[
              styles.feedbackCard,
              {
                transform: [
                  { translateX: feedbackCardAnimation.position.x },
                  { translateY: feedbackCardAnimation.position.y },
                  {
                    rotate: feedbackCardAnimation.rotation.interpolate({
                      inputRange: [-100, 0, 100],
                      outputRange: ['-10deg', '0deg', '10deg'],
                    }),
                  },
                ],
                opacity: feedbackCardAnimation.opacity,
              },
            ]}
            {...feedbackPanResponder.panHandlers}
          >
            <Ionicons name="sparkles-outline" size={60} color="#666666" />
            <Text style={styles.endingTitle}>ending</Text>
          </Animated.View>
        )}

        <View style={styles.paginationOverlay} pointerEvents="none">
          {cards.map((_, index) => (
            <View key={index} style={[styles.dot, currentCardIndex === index && styles.dotActive]} />
          ))}
          {showFeedbackCard && <View style={[styles.dot, currentCardIndex >= totalCards && styles.dotActive]} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    alignItems: 'center',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  placeholderItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  feedbackCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5000,
  },
  endingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginTop: 24,
  },
  paginationOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 10000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
  },
  dotActive: {
    backgroundColor: '#000',
  },
});
