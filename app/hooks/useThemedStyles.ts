import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { theme, type AppTheme } from "../theme";


export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleCreator: (theme: AppTheme) => T,
): T => {
  return useMemo(() => StyleSheet.create(styleCreator(theme)), [styleCreator]);
};
