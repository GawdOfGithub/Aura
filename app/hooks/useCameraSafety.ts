import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useCameraSafety = (isFocused: boolean, delay = 500) => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 1. Track App State (Background vs Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const isForeground = appState === "active";

  // 2. Handle Delayed Activation
  useEffect(() => {
    let timeout: any;

    if (isFocused && isForeground) {
      // If focused & foreground, wait for the delay (nav animation) before activating
      timeout = setTimeout(() => {
        setIsCameraActive(true);
      }, delay);
    } else {
      // If blurred or backgrounded, kill camera IMMEDIATELY
      setIsCameraActive(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isFocused, isForeground, delay]);

  return isCameraActive;
};
