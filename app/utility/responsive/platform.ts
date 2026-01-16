import { Platform, ViewStyle } from "react-native";
import { PLATFORM } from "./constants";
import { device } from "./scaling";

export const getBlurValue = (): number => {
  return Platform.OS === PLATFORM.ANDROID ? 40 : 15;
};

export const getShadow = (
  elevation: number = 4,
  color: string = "#000000",
): ViewStyle => {
  if (Platform.OS === PLATFORM.ANDROID) {
    return {
      elevation,
    };
  }

  const shadowOpacity = 0.15 + elevation * 0.02;
  const shadowRadius = elevation * 0.8;
  const shadowOffset = {
    width: 0,
    height: Math.round(elevation / 2),
  };

  return {
    shadowColor: color,
    shadowOffset,
    shadowOpacity: Math.min(shadowOpacity, 0.5),
    shadowRadius,
  };
};

export const getMinTouchArea = (
  currentSize: number = 0,
): { top: number; bottom: number; left: number; right: number } => {
  const MIN_TOUCH_SIZE = 44;
  const padding = Math.max(0, (MIN_TOUCH_SIZE - currentSize) / 2);

  return {
    top: padding,
    bottom: padding,
    left: padding,
    right: padding,
  };
};

export const platform = {
  blur: getBlurValue,
  shadow: getShadow,
  minTouchArea: getMinTouchArea,
  isIOS: device.isIOS,
  isAndroid: device.isAndroid,
  current: Platform.OS,
} as const;

export type PlatformUtils = typeof platform;
