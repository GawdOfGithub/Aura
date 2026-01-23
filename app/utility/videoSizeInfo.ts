import { Dimensions } from "react-native";
import RNFS from "react-native-fs";
import { scale } from "./responsive";

export const showVideoInfo = async (
  currentPath: string,
  isCompressed: boolean,
) => {
  try {
    const exists = await RNFS.exists(currentPath);
    if (exists) {
      const stat = await RNFS.stat(currentPath);
      const sizeInMB = (stat.size / (1024 * 1024)).toFixed(2);

      const typeLabel = !isCompressed
        ? "Original (Raw)"
        : "Compressed (Optimized)";

      console.log(
        "Video Info",
        `Type: ${typeLabel}\nPath: ${currentPath}\n\nSize: ${sizeInMB} MB`,
        [{ text: "OK" }],
      );
    } else {
      console.log("Error", "File not found");
    }
  } catch (error) {
    console.log("Error", "Could not get file info", error);
  }
};
const { width } = Dimensions.get("window");
export const videoAspectRatio = 1.778; // height/width 16:9

export const getVideoHeightFromWidth = (videoWidth: number = width) => {
  return scale.m(videoAspectRatio * videoWidth);
};
