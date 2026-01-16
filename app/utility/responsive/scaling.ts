import { Dimensions, PixelRatio, Platform } from "react-native";
import { BASELINE, PLATFORM } from "./constants";

const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get("window");
  return { width, height };
};

let cachedDimensions = getDeviceDimensions();

export const refreshDimensions = () => {
  cachedDimensions = getDeviceDimensions();
};

export const device = {
  get width() {
    return cachedDimensions.width;
  },
  get height() {
    return cachedDimensions.height;
  },
  get isIOS() {
    return Platform.OS === PLATFORM.IOS;
  },
  get isAndroid() {
    return Platform.OS === PLATFORM.ANDROID;
  },
  get pixelRatio() {
    return PixelRatio.get();
  },
  get fontScale() {
    return PixelRatio.getFontScale();
  },
} as const;

const horizontalScale = (size: number): number => {
  return (cachedDimensions.width / BASELINE.WIDTH) * size;
};

const verticalScale = (size: number): number => {
  return (cachedDimensions.height / BASELINE.HEIGHT) * size;
};

const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (horizontalScale(size) - size) * factor;
};

const fontScale = (size: number, factor: number = 0.5): number => {
  const scaledSize = moderateScale(size, factor);
  return scaledSize * PixelRatio.getFontScale();
};

const fontScaleFixed = (size: number, factor: number = 0.5): number => {
  return moderateScale(size, factor);
};

const widthPercent = (percent: number): number => {
  return (cachedDimensions.width * percent) / 100;
};

const heightPercent = (percent: number): number => {
  return (cachedDimensions.height * percent) / 100;
};

export const scale = {
  horizontal: horizontalScale,
  h: horizontalScale,
  vertical: verticalScale,
  v: verticalScale,
  moderate: moderateScale,
  m: moderateScale,
  font: fontScale,
  f: fontScale,
  fontFixed: fontScaleFixed,
  widthPercent,
  wp: widthPercent,
  heightPercent,
  hp: heightPercent,
} as const;

export type Scale = typeof scale;
