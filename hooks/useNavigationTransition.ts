import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";

interface UseNavigationTransitionProps {
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}


export function useNavigationTransition({
  onTransitionStart,
  onTransitionEnd,
}: UseNavigationTransitionProps = {}) {

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // 1. Transition Start Listener
    const unsubscribeStart = navigation.addListener("transitionStart", () => {
      setIsNavigating(true);
      if (onTransitionStart) {
        onTransitionStart();
      }
    });

    // 2. Transition End Listener
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

  return { isNavigating, setIsNavigating };
}
