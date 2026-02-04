import { UploadSignedData } from "@/app/types";
import * as FileSystem from "expo-file-system/legacy";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const performUpload = async (
  filePath: string,
  config: Omit<UploadSignedData, "chat_id">,
  retries = 3,
): Promise<string> => {
  let attempt = 0;

  while (attempt < retries) {
    try {
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

      // If status is 4xx (client error), retrying usually won't help (e.g., 403 Forbidden)
      // unless it's a 408 (Request Timeout) or 429 (Too Many Requests).
      if (
        uploadResult.status >= 400 &&
        uploadResult.status < 500 &&
        uploadResult.status !== 408 &&
        uploadResult.status !== 429
      ) {
        throw new Error(`S3 Client Error: ${uploadResult.status}`);
      }

      throw new Error(`S3 Upload Status: ${uploadResult.status}`);
    } catch (error) {
      attempt++;
      console.log(`Upload attempt ${attempt} failed:`, error);

      if (attempt >= retries) {
        throw new Error(`Upload failed after ${retries} attempts: ${error}`);
      }

      // Exponential backoff: Wait 1s, then 2s, then 4s...
      const delay = Math.pow(2, attempt) * 1000;
      await wait(delay);
    }
  }

  throw new Error("Unknown upload error");
};
