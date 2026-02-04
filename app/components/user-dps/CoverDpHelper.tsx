import { AppBaseUser, RelayState } from "@/app/types";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { scale } from "../../utility/responsive";
import CountdownTimer from "../time/CountdownTimer";

const baseAvatarSize = scale.m(120);
const containerSize = scale.m(343);

const smAvatarSize = baseAvatarSize;
const smCenterOffset = (containerSize - smAvatarSize) / 2;
const smSpread = scale.m(80);

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
        borderWidth: scale.m(1.56),
        borderColor: "rgba(255, 255, 255, 0)",
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

export const renderSingleUnseenAvatar = (user: AppBaseUser) => {
  const oneUserSize = scale.m(148);
  const oneUserOffset = (containerSize - oneUserSize) / 2;

  return (
    <Avatar
      source={{ uri: user.profilePhoto }}
      size={oneUserSize}
      style={{
        position: "absolute",
        top: oneUserOffset,
        left: oneUserOffset,
        zIndex: 1,
        width: oneUserSize,
        height: oneUserSize,
        borderRadius: oneUserSize / 2,
      }}
    />
  );
};

export const renderUnseenAvatars = (users: AppBaseUser[]) => {
  const activeUsers = users.length > 0 ? users.slice(0, 4) : [];

  if (activeUsers.length === 1) {
    return renderSingleUnseenAvatar(activeUsers[0]);
  } else if (activeUsers.length === 2) {
    const twoUserSize = scale.m(130);
    const twoUserOffset = (containerSize - twoUserSize) / 2;
    const spreadOffset = scale.m(50);

    return (
      <>
        <Avatar
          source={{ uri: activeUsers[0].profilePhoto }}
          size={twoUserSize}
          style={{
            position: "absolute",
            top: twoUserOffset,
            left: twoUserOffset - spreadOffset,
            zIndex: 1,
            width: twoUserSize,
            height: twoUserSize,
            borderRadius: twoUserSize / 2,
          }}
        />
        <Avatar
          source={{ uri: activeUsers[1].profilePhoto }}
          size={twoUserSize}
          style={{
            position: "absolute",
            top: twoUserOffset,
            left: twoUserOffset + spreadOffset,
            zIndex: 2,
            width: twoUserSize,
            height: twoUserSize,
            borderRadius: twoUserSize / 2,
          }}
        />
      </>
    );
  } else if (activeUsers.length === 3) {
    return (
      <>
        <Avatar
          source={{ uri: activeUsers[0].profilePhoto }}
          size={smAvatarSize}
          style={{
            position: "absolute",
            top: smCenterOffset,
            left: smCenterOffset - smSpread,
            zIndex: 1,
          }}
        />
        <Avatar
          source={{ uri: activeUsers[1].profilePhoto }}
          size={smAvatarSize}
          style={{
            position: "absolute",
            top: smCenterOffset - 20,
            left: smCenterOffset,
            zIndex: 2,
          }}
        />
        <Avatar
          source={{ uri: activeUsers[2].profilePhoto }}
          size={smAvatarSize}
          style={{
            position: "absolute",
            top: smCenterOffset,
            left: smCenterOffset + smSpread,
            zIndex: 3,
          }}
        />
      </>
    );
  } else {
    const fourUserSize = scale.m(100);
    const horizontalStep = scale.m(66);
    const totalWidth = fourUserSize + 3 * horizontalStep;
    const startX = (containerSize - totalWidth) / 2;

    const centerY = (containerSize - fourUserSize) / 2;
    const verticalDiff = scale.m(18);

    const showCount = users.length > 4;
    const countText = `+${users.length - 3}`;

    return (
      <>
        <Avatar
          source={{ uri: activeUsers[0].profilePhoto }}
          size={fourUserSize}
          style={{
            position: "absolute",
            top: centerY + verticalDiff,
            left: startX,
            zIndex: 1,
          }}
        />

        <Avatar
          source={{ uri: activeUsers[1].profilePhoto }}
          size={fourUserSize}
          style={{
            position: "absolute",
            top: centerY - verticalDiff,
            left: startX + horizontalStep,
            zIndex: 2,
          }}
        />

        <Avatar
          source={{ uri: activeUsers[2].profilePhoto }}
          size={fourUserSize}
          style={{
            position: "absolute",
            top: centerY - verticalDiff,
            left: startX + 2 * horizontalStep,
            zIndex: 3,
          }}
        />

        {showCount ? (
          <View
            style={{
              position: "absolute",
              top: centerY + verticalDiff,
              left: startX + 3 * horizontalStep,
              zIndex: 4,
              width: fourUserSize,
              height: fourUserSize,
              borderRadius: fourUserSize / 2,
              backgroundColor: "#1E1E1E",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: scale.m(1.56),
              borderColor: "rgba(255, 255, 255, 0)",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: scale.fontFixed(24),
                fontWeight: "bold",
              }}
            >
              {countText}
            </Text>
          </View>
        ) : (
          <Avatar
            source={{ uri: activeUsers[3].profilePhoto }}
            size={fourUserSize}
            style={{
              position: "absolute",
              top: centerY + verticalDiff,
              left: startX + 3 * horizontalStep,
              zIndex: 4,
            }}
          />
        )}
      </>
    );
  }
};

export const renderSeenAvatars = (
  users: AppBaseUser[],
  options: {
    relayCount: number;
    relayEndTime?: string;
    isActive?: boolean;
    relayState?: RelayState;
  },
) => {
  const visibleUsers = users.slice(0, 3);
  const smallAvatarSize = scale.m(48);
  const overlap = scale.m(14);
  const counterBubbleOverlap = scale.m(24);
  console.log(
    options.relayState,
    "relayStaterelayStaterelayStaterelayStaterelayStaterelayState",
  );
  return (
    <View
      style={{
        width: "100%",

        position: "absolute",
        bottom: 32,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",

        paddingHorizontal: scale.m(16),
      }}
    >
      {options.relayEndTime && options.isActive !== undefined && (
        <CountdownTimer
          relayEndTime={options.relayEndTime}
          isActive={options.isActive}
          relayState={options.relayState || "live"}
        />
      )}

      <View
        style={{
          flexDirection: "row",

          justifyContent: "space-between", // Separate ends
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: smallAvatarSize,
          }}
        >
          {visibleUsers.map((user, index) => (
            <Avatar
              key={user.id}
              source={{ uri: user.profilePhoto }}
              size={smallAvatarSize}
              style={{
                marginLeft: index === 0 ? 0 : -overlap,
                zIndex: index, // Rightmost has highest zIndex
                width: smallAvatarSize,
                height: smallAvatarSize,
                borderRadius: scale.m(33),
                borderWidth: 3,
                borderColor: "rgba(0, 0, 0, 1)",
              }}
            />
          ))}

          {users.length > 4 && (
            <View
              style={{
                marginLeft: -counterBubbleOverlap,
                zIndex: 100,
                width: smallAvatarSize,
                height: smallAvatarSize,
                borderRadius: smallAvatarSize / 2,
                backgroundColor: "rgba(255, 255, 255, 0.11)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: scale.m(2),
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: scale.fontFixed(16),
                  fontWeight: "bold",
                }}
              >
                +{users.length - 3}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            width: smallAvatarSize,
            height: smallAvatarSize,
            borderRadius: scale.m(43.61),
            backgroundColor: "#FFFFFF1C",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: scale.f(24),
              fontWeight: "bold",
            }}
          >
            {options.relayCount}
          </Text>
        </View>
      </View>
    </View>
  );
};
