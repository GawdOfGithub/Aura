import { scale } from "@/app/utility/responsive";
import {
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

export const useCardAnimations = (
  activeScrollY: SharedValue<number>,
  status: "live" | "missed" | "none",
  isActive: boolean,
) => {
  const MAX_HEIGHT = scale.v(120);
  const MIN_HEIGHT = scale.v(70);
  const MAX_BORDER_WIDTH = isActive ? scale.m(4) : 0;
  const MIN_BORDER_WIDTH = isActive ? scale.m(4) : 0;

  const initialBorderColor = isActive ? "rgba(255, 87, 25, 1)" : "transparent";

  const targetBorderColor = isActive
    ? "rgba(255, 87, 25, 1)"
    : "rgba(255, 255, 255, 0.12)";

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const clampedScrollY = Math.max(0, activeScrollY.value);

    return {
      height: interpolate(
        clampedScrollY,
        [0, 60],
        [MAX_HEIGHT, MIN_HEIGHT],
        Extrapolation.CLAMP,
      ),
      borderColor: interpolateColor(
        clampedScrollY,
        [0, 30],
        [initialBorderColor, targetBorderColor],
      ) as string,
      borderWidth: interpolate(
        clampedScrollY,
        [0, 30],
        [MAX_BORDER_WIDTH, MIN_BORDER_WIDTH],
        Extrapolation.CLAMP,
      ),
    };
  });

  const blockerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        activeScrollY.value,
        [0, 10],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  const participantsStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        activeScrollY.value,
        [0, 1],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            activeScrollY.value,
            [0, 20],
            [1, 0.8],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const STATUS_HEIGHT = scale.v(28);
  const GAP_MARGIN = scale.m(4);

  const leftStatusStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        activeScrollY.value,
        [0, 15],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        activeScrollY.value,
        [0, 30],
        [STATUS_HEIGHT, 0],
        Extrapolation.CLAMP,
      ),
      marginTop: interpolate(
        activeScrollY.value,
        [0, 30],
        [GAP_MARGIN, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const rightStatusStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        activeScrollY.value,
        [0, 30],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            activeScrollY.value,
            [0, 40],
            [10, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return {
    containerAnimatedStyle,
    blockerStyle,
    participantsStyle,
    leftStatusStyle,
    rightStatusStyle,
  };
};