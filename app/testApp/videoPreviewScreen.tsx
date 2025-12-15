import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import Video from "react-native-video";
import { compressVideoNative } from "../../utilities/videoCompressor"; // Import the helper

export const VideoPreviewScreen = ({
  path: originalPath, // Rename prop to avoid confusion
  onRetake,
}: {
  path: string;
  onRetake: () => void;
}) => {
  // 1. State to hold the final video path (starts with original, updates to compressed)
  const [currentPath, setCurrentPath] = useState(originalPath);
  const [isCompressing, setIsCompressing] = useState(false);
  const [durationSecs, setDurationSecs] = useState<number | null>(null);

  // 2. Trigger Compression on Mount
  useEffect(() => {
    const performCompression = async () => {
      setIsCompressing(true);

      const compressedUri = await compressVideoNative(originalPath);

      if (compressedUri) {
        // If successful, switch the player to the new smaller file
        // The user might see a tiny blip as the video reloads, which is normal
        console.log("Swapping to compressed video:", compressedUri);
        setCurrentPath(compressedUri);
      } else {
        Alert.alert("Notice", "Compression failed, using original file.");
      }

      setIsCompressing(false);
    };

    performCompression();
  }, [originalPath]);

  // 3. Updated Info Function
  const showVideoInfo = async () => {
    try {
      const exists = await RNFS.exists(currentPath);
      if (exists) {
        const stat = await RNFS.stat(currentPath);
        const sizeInMB = (stat.size / (1024 * 1024)).toFixed(2);
        const durationText = durationSecs
          ? `Duration: ${durationSecs.toFixed(1)} seconds`
          : "Duration: Loading...";

        const typeLabel =
          currentPath === originalPath
            ? "Original (Raw)"
            : "Compressed (Optimized)";

        Alert.alert(
          "Video Info",
          `Type: ${typeLabel}\nPath: ${currentPath}\n\nSize: ${sizeInMB} MB\n${durationText}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "File not found");
      }
    } catch (error) {
      Alert.alert("Error", "Could not get file info");
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: currentPath }} // Use state, not prop
        style={styles.fullScreenVideo}
        resizeMode='cover'
        repeat={true}
        controls={false}
        onLoad={(data) => {
          setDurationSecs(data.duration);
        }}
      />

      {/* Overlay Controls */}
      <View style={styles.previewUiContainer}>
        <Pressable onPress={onRetake} style={styles.iconButton}>
          <Text style={styles.buttonText}>X</Text>
        </Pressable>

        <Pressable
          onPress={showVideoInfo}
          style={[styles.iconButton, styles.infoButton]}>
          <Text style={styles.buttonText}>i</Text>
        </Pressable>
      </View>

      {/* 4. Optional: Show a subtle indicator while compressing */}
      {isCompressing && (
        <View style={styles.compressingOverlay}>
          <ActivityIndicator size='small' color='#fff' />
          <Text style={styles.compressingText}>Optimizing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Your existing styles remain the same)
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  previewUiContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoButton: {
    backgroundColor: "rgba(0,122,255,0.8)",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  // New Styles for the indicator
  compressingOverlay: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compressingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
