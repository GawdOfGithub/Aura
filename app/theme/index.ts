import { scale } from "../utility/responsive";
import { colors } from "./colors";

export const theme = {
  colors: {
    ...colors,

    background: colors.neutral[0],
    surface: colors.neutral[0],
    text: colors.neutral[90],
    textInverse: colors.neutral[0],
    accent: colors.primary[50],
    border: colors.neutral[30],

    success: colors.success[50],
    error: colors.error[50],
  },
  spacing: {
    xs: scale.moderate(4),
    sm: scale.moderate(8),
    md: scale.moderate(16),
    lg: scale.moderate(24),
    xl: scale.moderate(32),
    xxl: scale.moderate(48),
  },
  typography: {
    body: {
      fontSize: scale.font(16),
    },
    caption: {
      fontSize: scale.font(12),
    },
    header: {
      fontSize: scale.font(24),
    },
  },
} as const;

export type AppTheme = typeof theme;

export { colors } from "./colors";
