import { StackCardInterpolationProps } from "@react-navigation/stack";
import { Dimensions, Easing } from "react-native";
import { scale } from "./responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ======================================================
// CONFIGURATION: MATCH THE COVER VIDEO CIRCLE (CENTERED)
// ======================================================
const BUBBLE_SIZE = scale.m(320); // Size of the Cover's videoCircle (responsive)

// Scale factor to shrink screen to bubble size
const SCALE = BUBBLE_SIZE / SCREEN_WIDTH;

// ======================================================
// THE CUSTOM TRANSITION (VIDEO <-> CIRCLE)
// Animates width/height from rectangle to square for true circle
// Uses React Navigation's built-in Animated API
// ======================================================
export const videoToCircleTransition = {
  gestureEnabled: true,
  gestureDirection: "vertical" as const,
  gestureResponseDistance: SCREEN_HEIGHT,

  transitionSpec: {
    open: {
      animation: "timing" as const,
      config: {
        duration: 6000,
        easing: Easing.out(Easing.cubic),
      },
    },
    close: {
      animation: "timing" as const,
      config: {
        duration: 6000,
        easing: Easing.out(Easing.cubic),
      },
    },
  },

  cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => {
    const progress = current.progress;

    // Target position: The Cover's videoCircle appears to be centered
    // in the carousel area which has marginTop and the timer badge above it
    // We need to move the circle UP from center to match
    // Approximate offset: ~100-150px up from center
    const TARGET_Y_OFFSET = scale.v(-80); // Negative = move up (responsive)

    return {
      cardStyle: {
        // Absolute position to break out of flex layout
        position: "absolute" as const,

        // At scale=1, card is SCREEN_WIDTH x SCREEN_WIDTH (square, centered)
        // At scale=SCALE, card becomes BUBBLE_SIZE x BUBBLE_SIZE
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        left: 0,

        borderRadius: SCREEN_WIDTH / 2,
        top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2,

        backgroundColor: "#000",
        overflow: "hidden" as const,

        transform: [
          // {
          //   scale: progress.interpolate({
          //     inputRange: [0, 1],
          //     outputRange: [SCALE, 1],
          //   }),
          // },
          {
            // Stretch vertically to fill screen at progress=1
            // At progress=0: scaleY=1 (keeps square for circle)
            // At progress=1: scaleY stretches to full screen height
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.76, SCREEN_HEIGHT / SCREEN_WIDTH + 0.2],
            }),
          },
          {
            // Move up to match target bubble position
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [TARGET_Y_OFFSET, 0],
            }),
          },
        ],

        // borderRadius needs to scale with the card
        // At scale=1: card is SCREEN_WIDTH, radius should be 0
        // At scale=SCALE: card appears as BUBBLE_SIZE, radius = BUBBLE_SIZE/2
        // But borderRadius is applied BEFORE scale, so we need SCREEN_WIDTH/2 at progress=0
        // borderRadius: progress.interpolate({
        //   inputRange: [0, 1],
        //   outputRange: [SCREEN_WIDTH / 2, 0],
        // }),

        opacity: 1,
      },
      // overlayStyle: {
      //   opacity: progress.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [1, 0],
      //     extrapolate: "clamp",
      //   }),
      // },
    };
  },
};
