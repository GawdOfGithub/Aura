import { WorldSwitcherFooter } from "@/app/components/footer/WorldSwitcherFooter";
import WorldSwitcherHeader from "@/app/components/header/WorldSwitcherHeader";
import GroupCard from "@/app/components/world-switcher/GroupCard";
import { groupCardsData } from "@/app/components/world-switcher/mockData";
import { scale } from "@/app/utility/responsive";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";

const WorldSwitcher = (props: any) => {
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const [selectedId, setSelectedId] = React.useState(groupCardsData[0].id);
  const topCard = groupCardsData[0];
  const listCards = groupCardsData.slice(1);

  const handleCardPress = (id: string) => {
    setSelectedId(id);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const CARD_MAX_HEIGHT = scale.v(120);
  const CARD_MIN_HEIGHT = scale.v(70);
  const GAP = scale.m(16);
  const SCROLL_END_BUFFER = scale.v(22);

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    const clampedScrollY = Math.max(0, scrollY.value);
    const cardHeight = interpolate(
      clampedScrollY,
      [0, 60],
      [CARD_MAX_HEIGHT, CARD_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return {
      height: cardHeight + GAP,
    };
  });

  const scrollContentStyle = useAnimatedStyle(() => {
    const clampedScrollY = Math.max(0, scrollY.value);
    const cardHeight = interpolate(
      clampedScrollY,
      [0, 60],
      [CARD_MAX_HEIGHT, CARD_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );

    const dynamicBuffer = interpolate(
      clampedScrollY,
      [0, 60],
      [0, SCROLL_END_BUFFER],
      Extrapolation.CLAMP,
    );

    return {
      paddingTop: cardHeight + GAP + dynamicBuffer,
    };
  });

  return (
    <View style={styles.container}>
      <WorldSwitcherHeader />

      <View style={styles.contentArea}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
          style={styles.scrollView}
        >
          <Animated.View style={[styles.listContent, scrollContentStyle]}>
            {listCards.map((card) => (
              <GroupCard
                key={card.id}
                title={card.title}
                status={card.status}
                timestamp={card.timestamp}
                unreadCount={card.unreadCount}
                isActive={card.id === selectedId}
                participants={card.participants}
                onPress={() => handleCardPress(card.id)}
              />
            ))}
          </Animated.View>
        </Animated.ScrollView>

        <Animated.View style={[styles.firstCardOverlay, wrapperAnimatedStyle]}>
          <GroupCard
            title={topCard.title}
            status={topCard.status}
            timestamp={topCard.timestamp}
            isActive={topCard.id === selectedId}
            participants={topCard.participants}
            scrollY={scrollY}
            onPress={() => handleCardPress(topCard.id)}
          />
        </Animated.View>
      </View>

      <WorldSwitcherFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 1)",
  },
  contentArea: {
    flex: 1,
    position: "relative",
  },
  firstCardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,1)",
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  listContent: {
    alignItems: "center",
    gap: scale.m(16),
    paddingBottom: scale.v(160) + scale.v(12),
  },
});

export default WorldSwitcher;