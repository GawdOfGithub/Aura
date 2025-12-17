import { Alert } from "react-native";
import { Video } from "react-native-compressor";
import RNFS from "react-native-fs";

export const compressVideoNative = async (sourcePath: string) => {
  try {
    console.log("Starting native hardware compression...");

    // Target: 2 Mbps (Perfect for India 4G)
    const TARGET_BITRATE = 2 * 1000 * 1000;

    const resultPath = await Video.compress(sourcePath, {
      // 1. Compression Method: Manual allows exact control
      compressionMethod: "manual",

      // 2. The Bitrate Budget (2 Mbps)
      bitrate: TARGET_BITRATE,

      // 3. Max Resolution (Safe bet for quality/size ratio)
      maxSize: 1280, // 720p
    });

    // --- Verification ---
    const originalStat = await RNFS.stat(sourcePath);
    const newStat = await RNFS.stat(resultPath);

    const savedMB = ((originalStat.size - newStat.size) / 1024 / 1024).toFixed(
      2
    );
    console.log(`Original: ${(originalStat.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Saved: ${savedMB} MB`);

    return resultPath;
  } catch (error) {
    console.error("Compression failed:", error);
    Alert.alert("Error", "Video compression failed.");
    return "";
  }
};
