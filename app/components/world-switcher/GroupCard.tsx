// /home/anurag/video-chat-practice/app/components/world-switcher/GroupCard.tsx
import { WorldDpHelpers } from "@/app/components/dpHelpers/WorldDpHelpers";
import { useCardAnimations } from "@/app/hooks/animation/useCardScrollAnimation";
import { scale } from "@/app/utility/responsive";
import React from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SharedValue, useSharedValue } from "react-native-reanimated";

interface GroupCardProps {
  title: string;
  status: "live" | "missed" | "none";
  timestamp: string;
  unreadCount?: number;
  participants: ImageSourcePropType[];
  isActive: boolean;
  scrollY?: SharedValue<number>;
  onPress?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  title,
  status,
  timestamp,
  unreadCount,
  participants,
  isActive,
  scrollY,
  onPress,
}) => {
  const containerStyle = [styles.container, isActive && styles.liveContainer];

  const defaultScrollY = useSharedValue(0);
  const activeScrollY = scrollY || defaultScrollY;

  const initialBgColor = isActive
    ? "rgba(255, 87, 25, 0.12)"
    : "rgba(255, 255, 255, 0.12)";

  const outerRadius = isActive ? scale.m(32) : scale.m(32);
  const gap = isActive ? scale.m(6) : 0;
  const innerRadius = 17;
  const {
    containerAnimatedStyle,
    blockerStyle,
    participantsStyle,
    leftStatusStyle,
    rightStatusStyle,
  } = useCardAnimations(activeScrollY, status, isActive);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View
        style={[
          containerStyle,
          containerAnimatedStyle,
          { overflow: "hidden", padding: gap },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "#000000",
              borderRadius: innerRadius,
              zIndex: 1,
              top: gap,
              left: gap,
              right: gap,
              bottom: gap,
            },
            blockerStyle,
          ]}
        />

        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: initialBgColor,
              borderRadius: innerRadius,
              zIndex: 2,
              top: gap,
              left: gap,
              right: gap,
              bottom: gap,
            },
          ]}
        />

        <View style={[styles.cardContent, { zIndex: 10 }]}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: scale.m(8),
              }}
            >
              <Text style={styles.title}>{title}</Text>

              {status !== "live" && (unreadCount ?? 0) > 0 && (
                <View
                  style={{
                    width: scale.m(28),
                    height: scale.m(24.93),
                    borderRadius: scale.m(24.93),
                    backgroundColor: "rgba(255, 87, 25, 1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 1)",
                      fontFamily: "SN Pro",
                      fontSize: scale.m(16),
                      fontWeight: "700",
                    }}
                  >
                    {unreadCount ?? 0}
                  </Text>
                </View>
              )}
            </View>

            <Animated.View
              style={[
                leftStatusStyle,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: scale.m(12),
                },
              ]}
            >
              {status === "missed" && <Text style={styles.missed}>Missed</Text>}
              {status === "live" && (
                <View style={styles.liveTextContainer}>
                  <Text style={styles.live}>LIVE</Text>
                </View>
              )}
              {status !== "none" && <Text style={styles.dot}>•</Text>}
              <Text style={styles.hourago}>{timestamp}</Text>
            </Animated.View>
          </View>

          <View
            style={{
              position: "relative",
              minWidth: scale.m(84),
              minHeight: scale.m(40),
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={[participantsStyle, { position: "absolute", right: 0 }]}
            >
              <WorldDpHelpers participants={participants} />
            </Animated.View>

            <Animated.View
              style={[
                rightStatusStyle,
                {
                  position: "absolute",
                  right: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: scale.m(12),
                  justifyContent: "flex-end",
                  width: scale.m(200),
                },
              ]}
            >
              {status === "missed" && <Text style={styles.missed}>Missed</Text>}
              {status === "live" && (
                <View style={styles.liveTextContainer}>
                  <Text style={styles.live}>LIVE</Text>
                </View>
              )}
              {status !== "none" && <Text style={styles.dot}>•</Text>}
              <Text style={styles.hourago}>{timestamp}</Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: scale.m(343),
    height: scale.v(120),
    borderRadius: scale.m(32),
    borderColor: "transparent",
    gap: scale.m(6),
  },
  title: {
    fontFamily: "SN Pro",
    fontSize: scale.m(20),
    color: "rgba(255, 255, 255, 1)",
    fontWeight: "700",
    lineHeight: scale.v(28),
    letterSpacing: -0.3,
    textAlign: "center",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale.m(16),
  },
  liveContainer: {
    borderRadius: scale.m(24),
    borderColor: "rgba(255, 87, 25, 1)",
    gap: scale.m(4),
  },
  missed: {
    fontFamily: "SN Pro",
    fontSize: scale.m(16),
    fontWeight: "700",
    lineHeight: scale.v(20),
    color: "rgba(255, 50, 32, 1)",
  },
  liveTextContainer: {
    backgroundColor: "rgba(22, 117, 27, 0.12)",
    paddingHorizontal: scale.m(8),
    paddingVertical: scale.v(2),
    borderRadius: scale.m(8),
    alignItems: "center",
    justifyContent: "center",
  },
  live: {
    fontFamily: "SN Pro",
    fontSize: scale.m(16),
    fontWeight: "700",
    lineHeight: scale.v(20),
    color: "rgba(38, 199, 47, 1)",
  },

  dot: {
    fontFamily: "SN Pro",
    fontSize: scale.m(16),
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.4)",
    lineHeight: scale.v(28),
    letterSpacing: -0.3,
    textAlign: "center",
  },
  hourago: {
    fontFamily: "SN Pro",
    fontSize: scale.m(16),
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.4)",
    lineHeight: scale.v(28),
    letterSpacing: -0.3,
    textAlign: "center",
  },
});

export default GroupCard;
