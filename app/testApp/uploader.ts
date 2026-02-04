// import { compressVideoNative } from "@/utilities/videoCompressor";
// import * as FileSystem from "expo-file-system/legacy";
// import { GeneratePresignedURL, SendVideoURL } from "./urlList";

// // Configuration Types
// interface S3Config {
//   url: string;
//   key: string;
//   headers: Record<string, string>;
// }

// const uploadDataToServer = async (fileKeypath: string, userToken: string) => {
//   const response = await fetch(SendVideoURL(), {
//     method: "POST",
//     headers: {
//       Authorization: `Token ${userToken}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ file_path: fileKeypath }),
//   });
//   const data = await response.json();
//   // Ensure your backend returns { url: "...", key: "...", headers: { "Content-Type": "video/mp4" } }
//   return data;
// };

// const fetchPresignedUrl = async (fileName: string, userToken: string) => {
//   const response = await fetch(GeneratePresignedURL(), {
//     method: "POST",
//     headers: {
//       Authorization: `Token ${userToken}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ file_name: fileName, file_type: "video/mp4" }),
//   });
//   const data = await response.json();
//   // Ensure your backend returns { url: "...", key: "...", headers: { "Content-Type": "video/mp4" } }
//   return data;
// };

// const generateFileName = (originalUri: string) => {
//   const timestamp = new Date().getTime();
//   const ext = originalUri.split(".").pop();
//   return `video_${timestamp}.${ext}`;
// };

// /**
//  * Uploads a video file to S3 efficiently.
//  * Optimized for small-medium files (5-50MB).
//  * * @param filePath - The local URI of the file (e.g. file://...)
//  * @param getPresignedUrlFn - Async callback to fetch the presigned URL from your backend
//  * @param mimeType - Mime type of the file (e.g. video/mp4)
//  * @returns Promise<string> - The final uploaded S3 URL/Key
//  */
// export const uploadVideoToS3 = async (
//   filePath: string,
//   userToken: string,
//   mimeType: string = "video/mp4"
// ): Promise<string> => {
//   // 1. Validation: Check if file exists
//   const fileInfo = await FileSystem.getInfoAsync(filePath);
//   const compressedFilePath = await compressVideoNative(filePath);

//   if (!fileInfo.exists) {
//     throw new Error("File does not exist at path: " + compressedFilePath);
//   }
//   const fileNameKey = generateFileName(compressedFilePath || "my-file");
//   const MAX_RETRIES = 2;
//   let attempt = 0;

//   while (attempt < MAX_RETRIES) {
//     try {
//       attempt++;

//       // 2. Get the Pre-signed URL
//       // We fetch this *inside* the loop. If a retry happens,
//       // the URL might have expired, so it's safer to get a fresh one.
//       const config: S3Config = await fetchPresignedUrl(fileNameKey, userToken);
//       console.log(config, "+++");
//       console.log(`[Upload] Attempt ${attempt}: Starting upload ...`);

//       // 3. Perform the Upload
//       // We use UploadType.BINARY_CONTENT for a PUT request.
//       // This streams the file directly without loading it into JS memory.
//       const response = await FileSystem.uploadAsync(
//         config.url,
//         compressedFilePath,
//         {
//           httpMethod: "PUT",
//           uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
//           headers: {
//             ...config.headers,
//             "Content-Type": mimeType,
//           },
//         }
//       );

//       // 4. Handle Response
//       if (response.status === 200 || response.status === 204) {
//         console.log("[Upload] Success");
//         const serverResponse = await uploadDataToServer(config.key, userToken);
//         console.log("[Upload] Success 2");
//         return serverResponse.video_chat_id;
//       } else {
//         throw new Error(
//           `S3 Upload Failed with status: ${response.status} - ${response.body}`
//         );
//       }
//     } catch (error: any) {
//       console.error(`[Upload] Attempt ${attempt} failed:`, error.message);

//       if (attempt >= MAX_RETRIES) {
//         throw new Error(
//           `Failed to upload video after ${MAX_RETRIES} attempts. Last error: ${error.message}`
//         );
//       }
//       // Optional: Add a small delay before retry
//       await new Promise((res) => setTimeout(res, 1000));
//     }
//   }

//   throw new Error("Unexpected upload failure");
// };
