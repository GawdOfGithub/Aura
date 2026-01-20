import { scale } from "../../utility/responsive";

type MainState = "live" | "ended" | "missed";

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
  mainState: MainState,
  isExpired: boolean
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
