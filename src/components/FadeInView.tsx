import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
  style?: ViewStyle;
  onAnimEnd?: () => void;
}

export default function FadeInView({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  distance = 30,
  style,
  onAnimEnd,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && onAnimEnd) onAnimEnd();
    });

    return () => animation.stop();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up': return [{ translateY: translate }];
      case 'down': return [{ translateY: translate.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      case 'left': return [{ translateX: translate }];
      case 'right': return [{ translateX: translate.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      case 'fade': return [];
      default: return [{ translateY: translate }];
    }
  };

  return (
    <Animated.View
      style={[
        { opacity, transform: getTransform() },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
