import React, { forwardRef, useImperativeHandle } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const extraThickness = 0.4;

export interface ProgressRingHandle {
  play: () => void;
  pause: () => void;
  reset: () => void;
}

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  borderRadius: number;
  duration?: number;
}

export const ProgressRing = forwardRef<ProgressRingHandle, ProgressRingProps>(
  ({ size, strokeWidth, borderRadius, duration = 10000 }, ref) => {
    const radius = borderRadius;
    const innerSize = size - strokeWidth;

    const perimeter =
      2 * (innerSize + innerSize) - 8 * radius + 2 * Math.PI * radius;

    const progress = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      play: () => {
        const currentValue = progress.value;
        if (currentValue >= 1) return;

        const remainingDuration = (1 - currentValue) * duration;

        progress.value = withTiming(1, {
          duration: remainingDuration,
          easing: Easing.linear,
        });
      },

      pause: () => {
        cancelAnimation(progress);
      },

      reset: () => {
        cancelAnimation(progress);
        progress.value = 0;
      },
    }));

    const animatedProps = useAnimatedProps(() => {
      return {
        strokeDashoffset: -progress.value * perimeter,
      };
    });

    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ rotateZ: "180deg" }],
          overflow: "hidden",
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <AnimatedRect
            x={Math.round(strokeWidth / 2) - extraThickness}
            y={Math.round(strokeWidth / 2) - extraThickness}
            width={Math.round(size - strokeWidth)}
            height={Math.round(size - strokeWidth)}
            rx={Math.round(borderRadius)}
            ry={Math.round(borderRadius)}
            stroke="white"
            strokeWidth={strokeWidth + extraThickness}
            fill="transparent"
            strokeDasharray={perimeter}
            animatedProps={animatedProps}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </Svg>
      </View>
    );
  },
);
