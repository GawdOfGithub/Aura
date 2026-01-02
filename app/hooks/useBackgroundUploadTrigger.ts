import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import uploadQueueManager from "../modules/upload/uploadQueueManager";

export const useBackgroundUploadTrigger = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    uploadQueueManager.start();

    // 2. Trigger on State Change (Background -> Active)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App returned to foreground. Checking upload queue...");
        uploadQueueManager.start();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
