import { useCallback, useEffect, useRef, useState } from "react";
import { RelayState } from "../types";

interface UseVideoTimerProps {
  relayEndTime: string;
  isActive: boolean;
  mainState?: RelayState;
}

interface UseVideoTimerReturn {
  displayText: string;
  isExpired: boolean;
}

const calculateTimeDiff = (relayEndTime: string): number => {
  const endTime = new Date(relayEndTime).getTime();
  const now = Date.now();
  return Math.floor((endTime - now) / 1000);
};

export const formatTimerDisplay = (secondsDiff: number): string => {
  if (secondsDiff > 0) {
    const m = Math.floor(secondsDiff / 60);
    const s = secondsDiff % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else {
    const absSeconds = Math.abs(secondsDiff);
    const minutes = Math.floor(absSeconds / 60);
    const hours = Math.floor(absSeconds / 3600);

    if (minutes < 60) {
      return minutes <= 1 ? "1 minute ago" : `${minutes} mins ago`;
    } else {
      return hours <= 1 ? "1 hour ago" : `${hours} hours ago`;
    }
  }
};

const getUpdateInterval = (secondsDiff: number): number => {
  if (secondsDiff > 0) {
    return 1000;
  } else {
    const absSeconds = Math.abs(secondsDiff);
    if (absSeconds < 3600) {
      return 60000;
    } else {
      return 3600000;
    }
  }
};

export const useVideoTimer = ({
  relayEndTime,
  isActive,
  mainState,
}: UseVideoTimerProps): UseVideoTimerReturn => {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    calculateTimeDiff(relayEndTime),
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const updateTimer = useCallback(() => {
    if (!mountedRef.current) return;

    const diff = calculateTimeDiff(relayEndTime);
    setSecondsRemaining(diff);

    const interval = getUpdateInterval(diff);
    timeoutRef.current = setTimeout(updateTimer, interval);
  }, [relayEndTime]);

  useEffect(() => {
    mountedRef.current = true;

    if (!isActive) {
      return;
    }
    const initialDiff = calculateTimeDiff(relayEndTime);
    setSecondsRemaining(initialDiff);

    const interval = getUpdateInterval(initialDiff);
    timeoutRef.current = setTimeout(updateTimer, interval);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isActive, relayEndTime, updateTimer]);

  const isExpired = secondsRemaining <= 0;
  const displayText = formatTimerDisplay(secondsRemaining);

  return {
    displayText,
    isExpired,
  };
};

export default useVideoTimer;
