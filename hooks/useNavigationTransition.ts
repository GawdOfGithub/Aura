import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";

interface UseNavigationTransitionProps {
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

export function useNavigationTransition(
  navigation: StackNavigationProp<any>,
  { onTransitionStart, onTransitionEnd }: UseNavigationTransitionProps = {},
) {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const unsubscribeStart = navigation.addListener("transitionStart", () => {
      setIsNavigating(true);
      if (onTransitionStart) {
        onTransitionStart();
      }
    });

    const unsubscribeEnd = navigation.addListener("transitionEnd", () => {
      if (navigation.isFocused()) {
        setIsNavigating(false);
      }

      if (onTransitionEnd) {
        onTransitionEnd();
      }
    });

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, [navigation, onTransitionStart, onTransitionEnd]);

  return { isNavigating };
}
