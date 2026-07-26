import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  style?: ViewStyle;
}

export default function StaggeredList({
  children,
  staggerDelay = 80,
  duration = 400,
  direction = 'up',
  distance = 25,
  style,
}: Props) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <StaggerItem
          key={index}
          delay={index * staggerDelay}
          duration={duration}
          direction={direction}
          distance={distance}
          style={style}
        >
          {child}
        </StaggerItem>
      ))}
    </>
  );
}

function StaggerItem({
  children,
  delay,
  duration,
  direction,
  distance,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  duration: number;
  direction: string;
  distance: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up': return [{ translateY: translate }];
      case 'down': return [{ translateY: translate.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      case 'left': return [{ translateX: translate }];
      case 'right': return [{ translateX: translate.interpolate({ inputRange: [0, distance], outputRange: [0, -distance] }) }];
      default: return [{ translateY: translate }];
    }
  };

  return (
    <Animated.View style={[{ opacity, transform: getTransform() }, style]}>
      {children}
    </Animated.View>
  );
}
