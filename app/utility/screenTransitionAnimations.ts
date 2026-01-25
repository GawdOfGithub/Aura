import {
  StackCardInterpolationProps,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { Dimensions, Easing } from "react-native";
import { scale } from "./responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUBBLE_SIZE = scale.m(320);
const SCALE = BUBBLE_SIZE / SCREEN_WIDTH;

export const videoToCircleTransition: StackNavigationOptions = {
  gestureEnabled: true,
  gestureDirection: "vertical",
  gestureResponseDistance: SCREEN_HEIGHT,

  transitionSpec: {
    open: {
      animation: "timing" as const,
      config: {
        duration: 100,
        easing: Easing.out(Easing.circle),
      },
    },
    close: {
      animation: "timing" as const,
      config: {
        duration: 100,
        easing: Easing.out(Easing.circle),
      },
    },
  },

  cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => {
    const progress = current.progress;

    const TARGET_Y_OFFSET = scale.v(-80);

    return {
      cardStyle: {
        position: "absolute" as const,

        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        left: 0,

        borderRadius: SCREEN_WIDTH / 2,
        top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2,

        backgroundColor: "#000",
        overflow: "hidden" as const,

        transform: [
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.76, SCREEN_HEIGHT / SCREEN_WIDTH + 0.2],
            }),
          },
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [TARGET_Y_OFFSET, 0],
            }),
          },
        ],
        opacity: 1,
      },
    };
  },
};
