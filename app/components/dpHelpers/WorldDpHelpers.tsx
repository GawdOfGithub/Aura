// /home/anurag/video-chat-practice/app/components/dpHelpers
import { scale } from "@/app/utility/responsive";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  ViewStyle,
} from "react-native";

const AVATAR_SIZE = scale.m(48);
const SINGLE_AVATAR_SIZE = scale.m(84);
const AVATAR_OVERLAP = scale.m(0.3);
const ROW_OVERLAP = scale.m(2);

const PLACEHOLDER_IMAGE_1 = require("@/app/assets/images/png/test_image2.png");
const PLACEHOLDER_IMAGE_2 = require("@/app/assets/images/png/test_image2.png");

interface AvatarProps {
  source: ImageSourcePropType;
  size: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ source, size, style }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 0.4,
        borderColor: "rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
      },
      style,
    ]}
  >
    <Image
      source={source}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    />
  </View>
);

export interface ParticipantsLayoutProps {
  participants: ImageSourcePropType[];
}

export const WorldDpHelpers: React.FC<ParticipantsLayoutProps> = ({
  participants,
}) => {
  const actualParticipants =
    participants.length > 0
      ? participants
      : [
          PLACEHOLDER_IMAGE_1,
          PLACEHOLDER_IMAGE_2,
          PLACEHOLDER_IMAGE_1,
          PLACEHOLDER_IMAGE_2,
        ];

  const count = actualParticipants.length;

  const shouldShowBadge = count > 4;
  const extraCount = shouldShowBadge ? count - 3 : 0;
  const visibleParticipants = shouldShowBadge
    ? actualParticipants.slice(0, 3)
    : actualParticipants;
  const visibleCount = visibleParticipants.length;

  const containerWidth =
    visibleCount === 1 ? SINGLE_AVATAR_SIZE : AVATAR_SIZE * 2 - AVATAR_OVERLAP;
  const containerHeight =
    visibleCount === 1 ? SINGLE_AVATAR_SIZE : AVATAR_SIZE * 2 - ROW_OVERLAP;

  if (visibleCount === 1) {
    return <Avatar source={visibleParticipants[0]} size={SINGLE_AVATAR_SIZE} />;
  }

  if (visibleCount === 2) {
    return (
      <View
        style={{
          width: containerWidth,
          height: containerHeight,
          position: "relative",
        }}
      >
        <View style={{ position: "absolute", left: 0, top: 0, zIndex: 2 }}>
          <Avatar source={visibleParticipants[0]} size={AVATAR_SIZE} />
        </View>
        <View
          style={{
            position: "absolute",
            left: AVATAR_SIZE - AVATAR_OVERLAP,
            top: AVATAR_SIZE - ROW_OVERLAP,
            zIndex: 1,
          }}
        >
          <Avatar source={visibleParticipants[1]} size={AVATAR_SIZE} />
        </View>
      </View>
    );
  }

  if (visibleCount === 3 && extraCount === 0) {
    return (
      <View
        style={{
          width: containerWidth,
          height: containerHeight,
          position: "relative",
        }}
      >
        <View style={{ position: "absolute", left: 0, top: 0, zIndex: 3 }}>
          <Avatar source={visibleParticipants[1]} size={AVATAR_SIZE} />
        </View>
        <View
          style={{
            position: "absolute",
            left: AVATAR_SIZE - AVATAR_OVERLAP,
            top: 0,
            zIndex: 2,
          }}
        >
          <Avatar source={visibleParticipants[2]} size={AVATAR_SIZE} />
        </View>
        <View
          style={{
            position: "absolute",
            left: AVATAR_SIZE - AVATAR_OVERLAP,
            top: AVATAR_SIZE - ROW_OVERLAP,
            zIndex: 1,
          }}
        >
          <Avatar source={visibleParticipants[0]} size={AVATAR_SIZE} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width: containerWidth,
        height: containerHeight,
        position: "relative",
      }}
    >
      <View style={{ position: "absolute", left: 0, top: 0, zIndex: 4 }}>
        <Avatar source={visibleParticipants[1]} size={AVATAR_SIZE} />
      </View>
      <View
        style={{
          position: "absolute",
          left: AVATAR_SIZE - AVATAR_OVERLAP,
          top: 0,
          zIndex: 3,
        }}
      >
        <Avatar source={visibleParticipants[2]} size={AVATAR_SIZE} />
      </View>
      <View
        style={{
          position: "absolute",
          left: 0,
          top: AVATAR_SIZE - ROW_OVERLAP,
          zIndex: 2,
        }}
      >
        {extraCount > 0 ? (
          <View
            style={{
              width: AVATAR_SIZE * 0.92,
              height: AVATAR_SIZE * 0.92,
              borderRadius: (AVATAR_SIZE * 0.92) / 2,
              backgroundColor: "rgba(40, 40, 40, 0.95)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.4,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: scale.m(13),
                fontWeight: "600",
              }}
            >
              +{extraCount}
            </Text>
          </View>
        ) : (
          <Avatar source={visibleParticipants[0]} size={AVATAR_SIZE} />
        )}
      </View>
      <View
        style={{
          position: "absolute",
          left: AVATAR_SIZE - AVATAR_OVERLAP,
          top: AVATAR_SIZE - ROW_OVERLAP,
          zIndex: 1,
        }}
      >
        {extraCount > 0 ? (
          <Avatar source={visibleParticipants[0]} size={AVATAR_SIZE} />
        ) : (
          <Avatar source={visibleParticipants[3]} size={AVATAR_SIZE} />
        )}
      </View>
    </View>
  );
};
