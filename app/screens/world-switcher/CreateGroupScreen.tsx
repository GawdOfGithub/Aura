import CloseIcon from "@/app/assets/images/svg/CloseIcon";
import TickIcon from "@/app/assets/images/svg/TickIcon";
import CreateGroupHeader from "@/app/components/header/CreateGroupHeader";
import { scale } from "@/app/utility/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

const new_Image = require("../../assets/images/png/new_image.png");

const CONTACTS = [
  { id: "1", name: "Damon", status: "New here!" },
  { id: "2", name: "Maya", status: "3 groups together" },
  { id: "3", name: "Rohan", status: "" },
  { id: "4", name: "Keeanu", status: "1 group together" },
  { id: "5", name: "Anwesha", status: "" },
  { id: "6", name: "Bharat", status: "" },
  { id: "7", name: "Rahul", status: "" },
  { id: "8", name: "Priya", status: "2 groups together" },
];

export default function CreateGroupScreen({
  onNext,
  onClose,
  initialSelectedIds = [],
}: {
  onNext: (users: any[]) => void;
  onClose: () => void;
  initialSelectedIds?: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedUsers = [...selectedIds]
    .reverse()
    .map((id) => CONTACTS.find((user) => user.id === id))
    .filter((user) => user !== undefined);

  const hasSelection = selectedIds.length > 0;

  const renderItem = ({ item }: { item: (typeof CONTACTS)[0] }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.userInfoLeft}>
          <Image source={new_Image} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.status ? (
              <Text style={styles.userStatus}>{item.status}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.radioCircle, isSelected && styles.radioSelected]}>
          {isSelected && <TickIcon styles={{}} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <CreateGroupHeader onClose={onClose} />

      <Text style={styles.subHeader}>Who’s in?</Text>

      <FlatList
        data={CONTACTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, marginBottom: hasSelection ? scale.v(190) : 140 }}
        contentContainerStyle={{
          paddingBottom: hasSelection ? scale.v(20) : scale.v(450),
        }}
        showsVerticalScrollIndicator={false}
      />

      {hasSelection && (
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOutDown}
          style={styles.floatingSelectionBar}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              alignItems: "center",
            }}
          >
            {selectedUsers.map((user, index) => {
              return (
                <TouchableOpacity
                  // @ts-ignore
                  key={user.id}
                  // @ts-ignore
                  onPress={() => toggleSelection(user.id)}
                  style={styles.chip}
                >
                  {/* @ts-ignore */}
                  <Image source={new_Image} style={styles.chipImage} />
                  {/* @ts-ignore */}
                  <Text style={styles.chipText}>{user.name}</Text>

                  <View style={styles.closeIconContainer}>
                    <View style={styles.closeIconWrapper}>
                      <View
                        style={{
                          width: scale.m(28),
                          height: scale.v(28),
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CloseIcon
                          width="46%"
                          height="46%"
                          strokeWidth={2.3}
                          strokeOpacity={1}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,1)", "rgba(0,0,0,0)"]}
        style={styles.footer}
        pointerEvents="box-none"
      >
        <Text style={styles.footerHint}>
          Don’t see someone? Invite them next
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            const usersWithImages = selectedUsers.map((user) => ({
              ...user,
              image: new_Image,
            }));
            onNext(usersWithImages);
          }}
        >
          <Text style={styles.nextButtonText}>
            {selectedIds.length > 0 ? `Next (${selectedIds.length})` : "Next"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: scale.v(50),
  },

  subHeader: {
    color: "rgba(255, 255, 255, 0.64)",
    fontSize: scale.m(16),
    fontWeight: "bold",
    marginLeft: scale.m(20),
    marginTop: scale.v(35),
    marginBottom: scale.v(15),
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale.v(12),
    paddingHorizontal: scale.m(20),
  },
  userInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: scale.m(64),
    height: scale.m(64),
    borderRadius: scale.m(80),
    marginRight: scale.m(12),
    backgroundColor: "#333",
  },
  textContainer: { justifyContent: "center" },
  userName: {
    color: "rgba(255, 255, 255, 1)",
    fontSize: scale.m(18),
    fontWeight: "600",
  },
  userStatus: {
    color: "rgba(255, 255, 255, 0.56)",
    fontSize: scale.m(14),
    marginTop: 2,
    fontWeight: "400",
  },
  radioCircle: {
    width: scale.m(32),
    height: scale.m(32),
    borderRadius: scale.m(48),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    backgroundColor: "rgba(255, 87, 25, 1)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: scale.m(1.6),
  },
  floatingSelectionBar: {
    position: "absolute",
    bottom: scale.v(130),
    left: scale.m(20),
    right: scale.m(20),
    backgroundColor: "rgba(31, 31, 31, 1)",
    borderRadius: scale.m(24),
    height: scale.v(72),
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    zIndex: 20,
    elevation: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
    height: 36,
  },
  chipImage: {
    width: 28,
    height: 28,
    borderRadius: 80,
    marginRight: 6,
  },
  chipText: {
    color: "rgba(255, 255, 255, 1)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeIconContainer: {
    gap: scale.m(16),
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: scale.v(251),
    justifyContent: "flex-end",
    paddingHorizontal: scale.m(16),
    paddingBottom: scale.v(40),
    alignItems: "center",
    zIndex: 10,
  },
  footerHint: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: scale.m(16),
    marginBottom: scale.v(16),
    fontWeight: "600",
  },
  nextButton: {
    width: "100%",
    height: scale.v(48),
    backgroundColor: "rgba(255, 87, 25, 1)",
    borderRadius: scale.m(42),
    justifyContent: "center",
    alignItems: "center",
    gap: scale.m(10),
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: scale.m(16),
    fontWeight: "bold",
  },
});