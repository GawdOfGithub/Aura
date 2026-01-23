import useVideoTimer from "@/app/hooks/useVideoTimer";
import { RelayState } from "@/app/types";
import { ProgressiveBlurView } from "@sbaiahmed1/react-native-blur";
import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { scale } from "../../utility/responsive";

interface CountdownTimerProps {
  relayEndTime: string;
  isActive: boolean;
  relayState: RelayState;
}
export interface TimerStylesReturn {
  backgroundColor: string;
  overlayColor?: string;
  textColor: string;
  fontSize: number;
  fontWeight: "500" | "700";
  lineHeight: number;
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
        fontSize: isExpired ? scale.fontFixed(16) : scale.fontFixed(20),
        fontWeight: isExpired ? "500" : "700",
        lineHeight: isExpired ? scale.m(24) : scale.m(28),
        borderWidth: 0,
      };
    case "ended":
    case "missed":
      return {
        backgroundColor: "rgba(0, 0, 0, 0.69)",
        textColor: "rgba(255, 255, 255, 0.46)",
        fontSize: scale.fontFixed(16),
        fontWeight: "500",
        lineHeight: scale.m(24),
        borderWidth: 0,
      };
  }
};

const CountdownTimer = ({
  relayEndTime,
  isActive,
  relayState,
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
        <ProgressiveBlurView
          blurType="light"
          blurAmount={20}
          style={[
            styles.timerBadgeBlur,
            { backgroundColor: timerStyles.backgroundColor },
          ]}
          overlayColor={timerStyles.overlayColor}
        >
          <Text
            style={[
              styles.timerText,
              {
                color: timerStyles.textColor,
                fontSize: timerStyles.fontSize,
                fontWeight: timerStyles.fontWeight,
                lineHeight: timerStyles.lineHeight,
                fontFamily: "Inter",
                textAlign: "center",
              },
            ]}
          >
            {displayText}
          </Text>
        </ProgressiveBlurView>
      ) : (
        <View
          style={[
            styles.timerBadgeBlur,
            { backgroundColor: timerStyles.backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.timerText,
              {
                color: timerStyles.textColor,
                fontSize: timerStyles.fontSize,
                fontWeight: timerStyles.fontWeight,
                lineHeight: timerStyles.lineHeight,
                fontFamily: "Inter",
                textAlign: "center",
              },
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
    marginBottom: scale.v(20),
    minWidth: scale.m(75),
    height: scale.v(40),
    borderRadius: scale.m(12),
    overflow: "hidden",
    alignSelf: "center",
  },
  timerBadgeBlur: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 230, 42, 0.15)",
    paddingHorizontal: scale.h(12), // Increased padding for breathing room
    paddingVertical: scale.v(4),
  },
  timerText: {
    fontSize: scale.fontFixed(20),
    lineHeight: scale.m(28),
    color: "#26C72F",
    fontWeight: "700",
  },
});
