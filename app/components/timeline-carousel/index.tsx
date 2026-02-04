import { colors } from "@/app/theme";
import { VideoThumbnail } from "@/app/types";
import { scale } from "@/app/utility/responsive";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { CREATE_VIDEO_NOTE } from "@/app/screens/consumption";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { ProgressRingHandle } from "./ProgressRing";

// --- Constants ---
const PAGE_WIDTH = Dimensions.get("window").width;
const TILE_SIZE = 48;
const RING_SIZE = 52;
const RING_BORDER_WIDTH = 3;
const ITEM_SPACING = 12;
const CAROUSEL_ITEM_WIDTH = TILE_SIZE + ITEM_SPACING;

// --- 1. Base Tile Component ---
interface TileProps {
  item: VideoThumbnail;
  animationValue: SharedValue<number>;
  index: number;
  activeIndex: number;
  lastIndex?: number;
  isSeen: boolean;
  onPress: (index: number) => void;
}

const FilterTile: React.FC<TileProps> = ({
  item,
  animationValue,
  index,
  onPress,
  lastIndex,
  activeIndex,
  isSeen = true,
}) => {
  // Interpolate the scale based on the animation value.
  // The value ranges from -1 (previous) to 0 (active) to 1 (next).
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.85, 1, 0.85], // Scale: 0.85 when inactive, 1.0 when active
      "clamp",
    );

    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.6, 1, 0.6], // Optional: Fade out inactive items slightly
      "clamp",
    );

    return {
      transform: [{ scale }],
      //   opacity,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    // If the item is marked as "Seen" globally, hide overlay immediately
    if (isSeen) {
      return { opacity: 0 };
    }

    // Logic:
    // If value is 0 (Active) -> Opacity 0 (Hidden)
    // If value is +/- 1 (Inactive) -> Opacity 1 (Visible)
    const opacity = interpolate(
      animationValue.value,
      [-0.2, 0, 0.2],
      [1, 0, 1],
      //Extrapolation.CLAMP,
    );

    return { opacity };
  }, [isSeen]);

  if (item.videoId == CREATE_VIDEO_NOTE) {
    return (
      <View style={[styles.tileContainer]}>
        <Pressable onPress={() => onPress(index)}>
          <Animated.View
            style={[
              styles.tile,
              animatedStyle,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.success[90],
              },
            ]}
          >
            <Text
              style={{
                fontSize: scale.f(32),
                color: "#FFFFFFA3",
                marginTop: scale.v(-2),
              }}
            >
              +
            </Text>
          </Animated.View>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.tileContainer}>
      <Pressable onPress={() => onPress(index)}>
        <Animated.View style={[styles.tile, animatedStyle]}>
          {item.imagePath ? (
            <Image
              source={{ uri: item.imagePath }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <ActivityIndicator size={"small"} style={{ alignSelf: "center" }} />
          )}

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.overlayContainer,
              overlayStyle, // Attach the animated opacity here
            ]}
          >
            <View style={styles.dot} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

interface TimelineCarouselProps {
  data: VideoThumbnail[];
  activeIndex: number;
  onSnapToItem: (index: number) => void;
}

export const TimelineCarousel = forwardRef<
  ICarouselInstance,
  TimelineCarouselProps
>(({ data, activeIndex = 0, onSnapToItem }, ref) => {
  const progressRingRef = useRef<ProgressRingHandle>(null);

  const handleSnapToItem = (index: number) => {
    Haptics.selectionAsync();
    if (index != activeIndex) {
      onSnapToItem(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectionRing} pointerEvents="none" />
      {/* <View style={styles.selectionRingContainer} pointerEvents="none">
        <ProgressRing
          ref={progressRingRef}
          size={scale.m(60)}
          strokeWidth={scale.m(3)}
          borderRadius={scale.m(9.5)}
          duration={4000}
        />
      </View> */}
      <Carousel
        ref={ref}
        loop={false}
        width={CAROUSEL_ITEM_WIDTH}
        height={RING_SIZE + 20}
        style={styles.carousel}
        data={data}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1, // We handle scale manually in the Tile
          parallaxScrollingOffset: 0,
        }}
        defaultIndex={activeIndex}
        renderItem={({ item, index, animationValue }) => {
          return (
            <FilterTile
              item={item}
              animationValue={animationValue}
              index={index}
              onPress={(i) => {
                handleSnapToItem(i);
              }}
              lastIndex={data.length - 1}
              activeIndex={activeIndex}
              isSeen={true}
            />
          );
        }}
        onSnapToItem={handleSnapToItem}
        // style={{
        //   width: PAGE_WIDTH,
        //   justifyContent: "center",
        //   alignItems: "center",
        // }}
      />
    </View>
  );
});

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    width: "100%",

    height: scale.m(100),
    justifyContent: "center",
    alignItems: "center",
    // Black background like the screenshot
  },
  carousel: {
    width: PAGE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  tileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: scale.m(5),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectionRing: {
    position: "absolute",
    width: scale.m(60),
    height: scale.m(60),
    borderRadius: scale.m(10),
    borderWidth: RING_BORDER_WIDTH,
    borderColor: "white",
  },
  selectionRingContainer: {
    position: "absolute",
    zIndex: 10, // Ensure it sits on top
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContainer: {
    backgroundColor: "#0000008F",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: scale.m(6),
    height: scale.m(6),
    borderRadius: scale.m(3),
    backgroundColor: colors.neutral[0],
  },
});
