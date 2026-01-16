export const BASELINE = {
  WIDTH: 393,
  HEIGHT: 852,
} as const;

export const BREAKPOINTS = {
  SMALL: 375,
  MEDIUM: 414,
  LARGE: 768,
} as const;

export const PLATFORM = {
  IOS: "ios",
  ANDROID: "android",
} as const;

export type PlatformType = (typeof PLATFORM)[keyof typeof PLATFORM];
