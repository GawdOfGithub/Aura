import * as VideoThumbnails from "expo-video-thumbnails";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BUBBLE_SIZE = 70;
const BUBBLE_MARGIN = 12;
const ITEM_SIZE = BUBBLE_SIZE + BUBBLE_MARGIN * 2;
const PADDING_HORIZONTAL = (SCREEN_WIDTH - BUBBLE_SIZE) / 2 - BUBBLE_MARGIN;

export interface VideoItem {
  id: string;
  videoUri: string | number | null;
  createdBy: string;
  thumbnailUri?: string;
  isEmpty?: boolean;
}

interface VideoBubbleCarouselProps {
  videos: VideoItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
}

interface BubbleProps {
  video: VideoItem;
  index: number;
  scrollX: SharedValue<number>;
  activeIndex: number;
  onPress: () => void;
}

const SnapBubble = memo(
  ({ video, index, scrollX, activeIndex, onPress }: BubbleProps) => {
    const isActive = index === activeIndex;
    const thumbnailUri = video.thumbnailUri || null;
    const [generatedUri, setGeneratedUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(!thumbnailUri);
    const finalThumbnail = thumbnailUri || generatedUri;

    // Use pre-generated thumbnail if provided, otherwise generate
    useEffect(() => {
      // If we already have a thumbnail from props, we're done
      if (video.thumbnailUri) {
        setIsLoading(false);
        return;
      }

      // If we already generated one, we're done
      if (generatedUri) {
        setIsLoading(false);
        return;
      }

      const generateThumbnail = async () => {
        if (video.isEmpty || !video.videoUri) {
          setIsLoading(false);
          return;
        }

        try {
          const videoSource =
            typeof video.videoUri === "number"
              ? Image.resolveAssetSource(video.videoUri).uri
              : video.videoUri;

          const { uri } = await VideoThumbnails.getThumbnailAsync(videoSource, {
            time: 1000,
          });
          setGeneratedUri(uri);
        } catch (e) {
          console.log("Thumbnail error:", e);
        } finally {
          setIsLoading(false);
        }
      };

      generateThumbnail();
    }, [video.videoUri, video.isEmpty, video.thumbnailUri, generatedUri]);

    const animatedContainerStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 2) * ITEM_SIZE,
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
        (index + 2) * ITEM_SIZE,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.65, 0.82, 1.18, 0.82, 0.65],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.35, 0.65, 1, 0.65, 0.35],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    const outerRingStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
      ];

      const ringScale = interpolate(
        scrollX.value,
        inputRange,
        [0.9, 1.1, 0.9],
        Extrapolation.CLAMP
      );

      const ringOpacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale: ringScale }],
        opacity: ringOpacity,
      };
    });

    const innerRingStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
      ];

      const ringOpacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        opacity: ringOpacity,
      };
    });

    const pressScale = useSharedValue(1);

    const handlePressIn = () => {
      pressScale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
      pressScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const pressAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pressScale.value }],
    }));

    return (
      <Animated.View style={[styles.bubbleWrapper, animatedContainerStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={pressAnimatedStyle}>
            <Animated.View style={[styles.outerRing, outerRingStyle]} />
            <Animated.View style={[styles.innerRing, innerRingStyle]} />
            <View style={styles.bubble}>
              {isLoading ? (
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : finalThumbnail && finalThumbnail.length > 0 ? (
                <Image
                  source={{ uri: finalThumbnail }}
                  style={styles.thumbnail}
                />
              ) : (
                <View style={styles.emptyBubble}>
                  <Text style={styles.emptyIcon}>👤</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Pressable>

        <Animated.Text
          style={[styles.username, isActive && styles.usernameActive]}
          numberOfLines={1}
        >
          {video.createdBy}
        </Animated.Text>
      </Animated.View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.video.id === nextProps.video.id &&
    prevProps.index === nextProps.index &&
    prevProps.activeIndex === nextProps.activeIndex
);

export const VideoBubbleCarousel: React.FC<VideoBubbleCarouselProps> = ({
  videos,
  activeIndex,
  onActiveIndexChange,
  onScrollStart,
  onScrollEnd,
}) => {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const isScrolling = useSharedValue(false);
  const lastActiveIndex = useRef(activeIndex);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      isScrolling.value = true;
      if (onScrollStart) {
        runOnJS(onScrollStart)();
      }
    },
    onMomentumEnd: () => {
      isScrolling.value = false;
      if (onScrollEnd) {
        runOnJS(onScrollEnd)();
      }
    },
  });

  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / ITEM_SIZE);
      const clampedIndex = Math.max(0, Math.min(newIndex, videos.length - 1));

      if (clampedIndex !== lastActiveIndex.current) {
        lastActiveIndex.current = clampedIndex;
        onActiveIndexChange(clampedIndex);
      }
    },
    [videos.length, onActiveIndexChange]
  );

  useEffect(() => {
    if (activeIndex !== lastActiveIndex.current && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: activeIndex * ITEM_SIZE,
        animated: true,
      });
      lastActiveIndex.current = activeIndex;
    }
  }, [activeIndex]);

  const handleBubblePress = useCallback(
    (index: number) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: index * ITEM_SIZE,
          animated: true,
        });
      }
      lastActiveIndex.current = index;
      onActiveIndexChange(index);
    },
    [onActiveIndexChange]
  );

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: PADDING_HORIZONTAL },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={32}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        removeClippedSubviews={true}
      >
        {videos.map((video, index) => (
          <SnapBubble
            key={video.id}
            video={video}
            index={index}
            scrollX={scrollX}
            activeIndex={activeIndex}
            onPress={() => handleBubblePress(index)}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.centerIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    height: 145,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    overflow: "visible",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  bubbleWrapper: {
    width: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: BUBBLE_SIZE + 16,
    height: BUBBLE_SIZE + 16,
    borderRadius: (BUBBLE_SIZE + 16) / 2,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.95)",
    top: -8,
    left: -8,
    zIndex: 10,
    elevation: 10,
  },
  innerRing: {
    position: "absolute",
    width: BUBBLE_SIZE + 8,
    height: BUBBLE_SIZE + 8,
    borderRadius: (BUBBLE_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    top: -4,
    left: -4,
    zIndex: 10,
    elevation: 10,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: "#222",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  loadingBubble: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  placeholderBubble: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2d4a3d",
  },
  placeholderEmoji: {
    fontSize: 20,
  },
  emptyBubble: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  emptyIcon: {
    fontSize: 18,
    opacity: 0.3,
  },
  username: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    fontWeight: "500",
    marginTop: 18,
    maxWidth: BUBBLE_SIZE + 10,
    textAlign: "center",
  },
  usernameActive: {
    color: "#fff",
    fontWeight: "700",
  },
  centerIndicator: {
    position: "absolute",
    bottom: 0,
    left: SCREEN_WIDTH / 2 - 15,
    width: 30,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
  },
  emptyContainer: {
    height: 105,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
