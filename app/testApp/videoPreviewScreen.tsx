import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import Video from "react-native-video";
import { compressVideoNative } from "../../utilities/videoCompressor";

// Define the expected params for type safety (optional but recommended)
type VideoStats = {
  originalSize: string; // in MB
  compressedSize: string; // in MB
};

export const VideoPreviewScreen = ({ route, navigation }: any) => {
  // 1. Get the video path from navigation params
  // Using generic "any" for props, but usually you'd use NativeStackScreenProps
  const originalPath = route.params?.path;

  const [compressedPath, setCompressedPath] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(true);
  const [viewMode, setViewMode] = useState<"original" | "compressed">(
    "original"
  );
  const [videoDuration, setVideoDuration] = useState(0);
  const [stats, setStats] = useState<VideoStats>({
    originalSize: "...",
    compressedSize: "...",
  });

  // 2. Handle Retake (Go Back)
  const handleRetake = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (!originalPath) return;

    const prepareVideo = async () => {
      try {
        setIsCompressing(true);

        // Get Original Size
        const origStat = await RNFS.stat(originalPath);
        const origSizeMB = (origStat.size / (1024 * 1024)).toFixed(2);
        setStats((prev) => ({ ...prev, originalSize: origSizeMB }));

        // Start Compression
        const compressedUri = await compressVideoNative(originalPath);

        if (compressedUri) {
          const compStat = await RNFS.stat(compressedUri);
          const compSizeMB = (compStat.size / (1024 * 1024)).toFixed(2);

          setCompressedPath(compressedUri);
          setStats((prev) => ({ ...prev, compressedSize: compSizeMB }));
        }
      } catch (error) {
        console.error("Compression/Stat error:", error);
      } finally {
        setIsCompressing(false);
      }
    };

    prepareVideo();
  }, [originalPath]);

  // Determine active source
  const activePath =
    viewMode === "compressed" && compressedPath ? compressedPath : originalPath;
  const activeSize =
    viewMode === "compressed" ? stats.compressedSize : stats.originalSize;
  const isShowingCompressed = viewMode === "compressed";

  if (!originalPath) return null;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: activePath }}
        style={styles.fullScreenVideo}
        resizeMode='cover'
        repeat={true}
        controls={false}
        onLoad={(data) => setVideoDuration(data.duration)}
      />

      {/* --- Top Overlay: Info --- */}
      <View style={styles.topOverlay}>
        <Pressable onPress={handleRetake} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <View style={styles.infoPill}>
          <Text style={styles.infoTitle}>
            {isShowingCompressed ? "COMPRESSED" : "ORIGINAL"}
          </Text>
          <Text style={styles.infoDetails}>
            {activeSize} MB • {videoDuration.toFixed(1)}s
          </Text>
        </View>

        {/* Empty view to balance the flex layout (so pill stays centered) */}
        <View style={{ width: 40 }} />
      </View>

      {/* --- Bottom Overlay: Toggle --- */}
      <View style={styles.bottomControls}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "original" && styles.toggleActive,
            ]}
            onPress={() => setViewMode("original")}>
            <Text
              style={[
                styles.toggleText,
                viewMode === "original" && styles.toggleTextActive,
              ]}>
              Original
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "compressed" && styles.toggleActive,
              !compressedPath && styles.toggleDisabled,
            ]}
            disabled={!compressedPath}
            onPress={() => setViewMode("compressed")}>
            {isCompressing ? (
              <ActivityIndicator size='small' color='#999' />
            ) : (
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "compressed" && styles.toggleTextActive,
                ]}>
                Compressed
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isCompressing && (
          <Text style={styles.statusText}>Optimizing video...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  // TOP SECTION
  topOverlay: {
    position: "absolute",
    top: 60, // Adjust for Safe Area if needed
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  infoPill: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  infoTitle: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoDetails: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  // BOTTOM SECTION
  bottomControls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(50,50,50,0.8)",
    borderRadius: 30,
    padding: 4,
    width: 240,
    height: 50,
  },
  toggleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 26,
  },
  toggleActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleText: {
    color: "#aaa",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "black",
    fontWeight: "bold",
  },
  statusText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});
