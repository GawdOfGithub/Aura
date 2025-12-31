import { UploadSignedData } from "@/app/types";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Step 3: Perform the Upload
 * Uses BACKGROUND session to ensure it survives if the Background Service dies mid-transfer.
 */
export const performUpload = async (
  filePath: string,
  config: UploadSignedData
): Promise<string> => {
  const uploadResult = await FileSystem.uploadAsync(config.url, filePath, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    headers: {
      ...config.headers,
      "Content-Type": "video/mp4",
    },
  });

  if (uploadResult.status >= 200 && uploadResult.status < 300) {
    return config.key;
  }

  throw new Error(`S3 Upload Failed: ${uploadResult.status}`);
};
