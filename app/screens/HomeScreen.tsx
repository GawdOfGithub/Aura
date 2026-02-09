import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import {
  CameraControls,
  Cover,
  HomeScreenHeaders,
  WorldToggleButton,
} from "../components";
import Carousel from "react-native-reanimated-carousel";
import { EmptyCover } from "../components/relay/Cover";
import { useChatInfo } from "../store/features/chats/chatApi";
import { selectCurrentActiveChatId } from "../store/features/chats/chatSlice";
import { usePrefetch } from "../store/features/posts/postsApi";
import { useAppSelector } from "../store/hooks";
import { AppRelay } from "../types";
import { scale } from "../utility/responsive";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
import { RootStackParamList } from "../types/navigation";

const FOOTER_HEIGHT = scale.m(308);
const HEADER_HEIGHT = scale.m(104);

interface User {
  id: string;
  name: string;
  dp: any;
}

interface HomeScreenProps {
  navigation: any;
  initialIndex?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,

  initialIndex = 0,
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);
  const chatId = useAppSelector(selectCurrentActiveChatId);

  const { data: chat, isLoading } = useChatInfo(chatId);
  const relays = chat?.relays || [];
  const prefetchPosts = usePrefetch("getRelayPosts");

  

  const carouselRef = useRef<any>(null);

  const renderVideoItem = useCallback(
    ({ item, index }: { item: AppRelay; index: number }) => {
      return (
        <Pressable
          onPress={() =>
            navigation.navigate("Consumption", { chatId, relayId: item.id })
          }
        >
          <Cover
            chatId={chatId ?? ""}
            relayId={item.id}
            videoSource={item.firstPost.videoFile}
            relayEndTime={item.endTime}
            newCount={item.numberPosts}
            isActive={index === currentVideoIndex}
            isScrolling={isScrolling}
            users={item.usersParticipated}
          />
        </Pressable>
      );
    },
    [currentVideoIndex, isScrolling, chatId],
  );

  const handleVideoCaptured = useCallback((path: string) => {
    console.log("Video captured:", path);
  }, []);
  const handlePrefetchingRelays = (index: number) => {
    const currentRelay = relays[index];
    if (currentRelay && chat) {
      prefetchPosts({ chatId: chat.id, relayId: currentRelay.id });
    }
    // Prefetch the NEXT relay (Predictive loading)

    const nextIndex = (index + 1) % relays.length;
    const nextRelay = relays[nextIndex];
    if (nextRelay && chat) {
      prefetchPosts({ chatId: chat.id, relayId: nextRelay.id });
    }
  };
  return (
    <View style={styles.container}>
      <HomeScreenHeaders headerHeight={HEADER_HEIGHT} groupName={chat?.name} />

      <View
        style={{
          height: SCREEN_HEIGHT - FOOTER_HEIGHT - HEADER_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: scale.v(30),
        }}
      >
        {relays.length > 0 ? (
          <Carousel
            ref={carouselRef}
            loop={true}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT - scale.v(370)}
            vertical={true}
            data={relays}
            windowSize={3}
            renderItem={renderVideoItem}
            onScrollStart={() => setIsScrolling(true)}
            onScrollEnd={(index) => {
              setCurrentVideoIndex(index);
              setIsScrolling(false);
              handlePrefetchingRelays(index);
            }}
            style={{ flex: 1 }}
          />
        ) : (
          <EmptyCover />
        )}
      </View>
      {chat?.id && (
        <CameraControls
          cameraWrapperPositionFromBottom={scale.m(150)}
          chatId={chat.id}
        />
      )}

       <WorldToggleButton
          onPress={() => navigation.navigate("WorldSwitcher")}
           footerPositionFromBottom={scale.m(40)}
        />
      {/* <BlurBGCamera /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "black",
  },

  worldSwitcherContainer: {
    height: scale.m(256),
    alignItems: "center",
  },
});

export default HomeScreen;
