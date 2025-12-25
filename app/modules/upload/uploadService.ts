import * as FileSystem from "expo-file-system/legacy";

// --- Configuration ---
const API_BASE_URL = "https://api.yourdomain.com";

interface PresignedResponse {
  url: string;
  key: string;
  headers: Record<string, string>;
}

/**
 * Step 2: Fetch CloudFront-Swapped Presigned URL
 */
const getUploadConfig = async (
  fileName: string,
  token: string
): Promise<PresignedResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/upload-url/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_name: fileName }),
  });

  if (!response.ok) throw new Error(`Auth/Server Error: ${response.status}`);
  return await response.json();
};

/**
 * Step 3: Perform the Upload
 * Uses BACKGROUND session to ensure it survives if the Background Service dies mid-transfer.
 */
export const performUpload = async (
  filePath: string,
  userToken: string
): Promise<string> => {
  // 1. Generate unique filename
  const ext = filePath.split(".").pop() || "mp4";
  const fileName = `vid_${Date.now()}_${Math.floor(
    Math.random() * 1000
  )}.${ext}`;

  // 2. Get URL
  const config = await getUploadConfig(fileName, userToken);

  // 3. Upload to S3
  // Note: We await this. Since we use 'react-native-background-actions',
  // the JS thread stays alive to receive this response (mostly).
  const uploadResult = await FileSystem.uploadAsync(config.url, filePath, {
    httpMethod: "PUT",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND, // <--- iOS Safety Net
    headers: {
      ...config.headers,
      "Content-Type": "video/mp4",
    },
  });

  if (uploadResult.status >= 200 && uploadResult.status < 300) {
    // 4. Cleanup (Delete compressed file)
    await FileSystem.deleteAsync(filePath, { idempotent: true });

    // 5. Notify Backend (Sync)
    // Optional: Call your webhook endpoint here if Lambda isn't fully trusted
    return config.key;
  }

  throw new Error(`S3 Upload Failed: ${uploadResult.status}`);
};
