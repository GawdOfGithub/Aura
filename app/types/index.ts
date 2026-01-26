export * from "./serverResponse";
export type RelayState = "live" | "ended" | "missed";
export type VideoStatus = "seen" | "unseen";
export type MinimalVideoItem = {
  videoId: string;
  videoPath: string;
  // capturedTime: string;
};
