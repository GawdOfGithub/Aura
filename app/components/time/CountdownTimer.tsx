import useVideoTimer from "@/app/hooks/useVideoTimer";
import { RelayState } from "@/app/types";
import React from "react";

import { StyleSheet, Text, TextStyle, View } from "react-native";
import { scale } from "../../utility/responsive";

interface CountdownTimerProps {
  relayEndTime: string;
  isActive: boolean;
  relayState: RelayState;
  textStyle?: TextStyle;
}
export interface TimerStylesReturn {
  backgroundColor: string;
  overlayColor?: string;
  textColor: string;
  fontSize: number;
  fontWeight: "500" | "700";
  lineHeight?: number;
  borderWidth: number;
}

export const getTimerStyles = (
  mainState: RelayState,
  isExpired: boolean,
): TimerStylesReturn => {
  switch (mainState) {
    case "live":
      return {
        backgroundColor: isExpired
          ? "rgba(0, 0, 0, 0.9)"
          : "rgba(30, 230, 42, 0.15)",
        overlayColor: isExpired ? undefined : "rgba(30, 230, 42, 0.15)",
        textColor: isExpired ? "rgba(255, 255, 255, 0.46)" : "#26C72F",
        fontSize: isExpired ? scale.f(16) : scale.f(20),
        fontWeight: isExpired ? "500" : "700",

        borderWidth: 0,
      };
    case "ended":
      return {
        backgroundColor: "rgba(0, 0, 0, 0.69)",
        textColor: "#FFFFFF",
        fontSize: scale.f(16),
        fontWeight: "500",

        borderWidth: 0,
      };
    case "missed":
    case "loading":
      return {
        backgroundColor: "rgba(0, 0, 0, 0.69)",
        textColor: "rgba(255, 255, 255, 0.46)",
        fontSize: scale.f(16),
        fontWeight: "500",

        borderWidth: 0,
      };
  }
};

const CountdownTimer = ({
  relayEndTime,
  isActive,
  relayState,
  textStyle,
}: CountdownTimerProps) => {
  const { displayText, isExpired } = useVideoTimer({
    relayEndTime,
    isActive,
    mainState: relayState,
  });

  const timerStyles = getTimerStyles(relayState, isExpired);
  return (
    <View style={[styles.timerBadge, { borderWidth: timerStyles.borderWidth }]}>
      {relayState === "live" ? (
        <Text
          style={[
            styles.timerText,
            {
              color: timerStyles.textColor,
              fontSize: timerStyles.fontSize,
              fontWeight: timerStyles.fontWeight,
              lineHeight: timerStyles.lineHeight,
              fontFamily: "Inter",
            },
            textStyle,
          ]}
        >
          {displayText}
        </Text>
      ) : (
        <View>
          <Text
            style={[
              styles.timerText,
              {
                color: timerStyles.textColor,
                fontSize: timerStyles.fontSize,
                fontWeight: timerStyles.fontWeight,
                lineHeight: timerStyles.lineHeight,
              },
              textStyle,
            ]}
          >
            {displayText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CountdownTimer;

const styles = StyleSheet.create({
  timerBadge: {
    marginTop: 0,
    minWidth: scale.m(75),
    marginBottom: scale.v(12),
    borderRadius: scale.m(12),
    overflow: "hidden",
  },

  timerText: {
    fontSize: scale.f(20),
    lineHeight: scale.m(28),
    color: "#26C72F",
    fontWeight: "700",
  },
});
