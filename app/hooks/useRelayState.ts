import { useMemo } from "react";
import { useGetRelayFromChat } from "../store/features/chats/chatSlice";
import { RelayState } from "../types";

type UseRelayStateParams = {
  chatId: string;
  relayId: string;
  currentUserId: string | undefined;
};

export function useRelayState({
  chatId,
  relayId,
  currentUserId,
}: UseRelayStateParams): RelayState {
  const { relay, isLoading } = useGetRelayFromChat(chatId, relayId);
  return useMemo(() => {
    if (isLoading) return "loading";
    if (!relay || !currentUserId) return "missed";
    const { endTime: relayEndTime, usersParticipated: users } = relay;
    const now = Date.now();
    const endTime = new Date(relayEndTime).getTime();

    if (endTime > now) {
      return "live";
    }

    const hasParticipated = users?.some((user) => user.id === currentUserId);

    return hasParticipated ? "ended" : "missed";
  }, [relay, currentUserId, isLoading]);
}
