import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  borderRadius: number;
  duration?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  strokeWidth,
  borderRadius,
  duration = 10000,
}) => {
  // Perimeter of rounded rect ≈ 2 * (w + h) - 8 * r + (2 * PI * r)
  // Simplified for a square: 4 * size - 8 * r + 2 * PI * r
  // Or more simply: The perimeter of the path the stroke travels.
  const radius = borderRadius;
  const innerSize = size - strokeWidth;
  const perimeter =
    2 * (innerSize + innerSize) - 8 * radius + 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(1)).current;
  const [debugSecond, setDebugSecond] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugSecond((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          return 10;
        }

        const nextSec = prev + 1;

        const toValue = 1 - nextSec / 10;

        Animated.timing(progressAnimation, {
          toValue: toValue,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start();

        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Interpolate the 0-1 value to the actual pixel length of the border
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, perimeter], // 0 = Full border, Perimeter = No border
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={size} height={size}>
        <AnimatedRect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={size - strokeWidth}
          height={size - strokeWidth}
          rx={borderRadius}
          ry={borderRadius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={perimeter}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};
