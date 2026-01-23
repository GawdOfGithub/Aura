import { colors } from "@/app/theme";
import { scale } from "@/app/utility/responsive";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

// --- Constants ---
const PAGE_WIDTH = Dimensions.get("window").width;
const TILE_SIZE = 48;
const RING_SIZE = 52;
const RING_BORDER_WIDTH = 3;
const ITEM_SPACING = 12;
const CAROUSEL_ITEM_WIDTH = TILE_SIZE + ITEM_SPACING;

// --- Types ---
type VideoItem = {
  id: string;
  image: string;
};

// --- 1. Base Tile Component ---
interface TileProps {
  item: VideoItem;
  animationValue: SharedValue<number>;
  index: number;
  activeIndex: number;
  isSeen: boolean;
  onPress: (index: number) => void;
}

const FilterTile: React.FC<TileProps> = ({
  item,
  animationValue,
  index,
  onPress,
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

  return (
    <View style={styles.tileContainer}>
      <Pressable onPress={() => onPress(index)}>
        <Animated.View style={[styles.tile, animatedStyle]}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
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
  data: VideoItem[];
  firstIndex?: number;
  onSnapToItem?: (index: number) => void;
}

export const TimelineCarousel: React.FC<TimelineCarouselProps> = ({
  data,
  firstIndex = 0,
  onSnapToItem,
}) => {
  const timelineRef = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const handleSnapToItem = (index: number) => {
    Haptics.selectionAsync();
    if (onSnapToItem) {
      onSnapToItem(index);
      setActiveIndex(index);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.selectionRing} pointerEvents="none" />

      <Carousel
        ref={timelineRef}
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
        defaultIndex={firstIndex}
        renderItem={({ item, index, animationValue }) => (
          <FilterTile
            item={item}
            animationValue={animationValue}
            index={index}
            onPress={(i) =>
              timelineRef?.current?.scrollTo({ index: i, animated: true })
            }
            activeIndex={activeIndex}
            isSeen={false}
          />
        )}
        onSnapToItem={handleSnapToItem}
        // style={{
        //   width: PAGE_WIDTH,
        //   justifyContent: "center",
        //   alignItems: "center",
        // }}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: scale.v(100),
    height: 100, // Adjust based on your footer height
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
    zIndex: 10,
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
