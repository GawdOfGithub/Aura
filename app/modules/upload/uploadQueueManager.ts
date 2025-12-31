import { compressVideoNative } from "@/utilities/videoCompressor";
import BackgroundService from "react-native-background-actions";
import { store } from "../../store"; // Import your Redux Store instance
import {
  getUploadConfigById,
  markUploading,
  selectItemById,
  selectNextJobId,
  uploadFailure,
  uploadSuccess,
} from "../../store/features/upload/uploadSlice";
import { performUpload } from "./uploadService";

const SLEEP_DELAY = 1000; // 1 second

class UploadQueueManager {
  private static instance: UploadQueueManager;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): UploadQueueManager {
    if (!UploadQueueManager.instance) {
      UploadQueueManager.instance = new UploadQueueManager();
    }
    return UploadQueueManager.instance;
  }

  /**
   * The "Brain" of the operation.
   * This function runs inside the Background Service.
   */
  private backgroundTask = async (taskDataArguments?: any) => {
    console.log("[UploadQueue] Service Started");

    // LOOP: Run as long as the service is allowed by OS
    while (BackgroundService.isRunning()) {
      const state = store.getState();
      const nextJobId = selectNextJobId(state);

      // A. If Queue is Empty -> Kill Service
      if (!nextJobId) {
        console.log("[UploadQueue] Queue empty. Stopping service.");
        await BackgroundService.stop();
        this.isRunning = false;
        break;
      }

      // B. Process the Job
      await this.processJob(nextJobId);

      // C. Sleep briefly to be nice to the CPU
      await new Promise((resolve) => setTimeout(resolve, SLEEP_DELAY));
    }

    console.log("[UploadQueue] Service Stopped");
  };

  /**
   * Processes a single video upload
   */
  private processJob = async (jobId: string) => {
    const state = store.getState();
    const job = selectItemById(state, jobId);
    const config = getUploadConfigById(state, jobId);

    if (!job || !config) return;

    try {
      store.dispatch(markUploading(jobId));

      // 1. Compress
      const compressedUri = await compressVideoNative(job.localUri ?? "");

      // 2. Upload
      const s3Key = await performUpload(compressedUri, config);

      // 3. Success Dispatch
      store.dispatch(uploadSuccess({ id: jobId, key: s3Key }));
      console.log(`[UploadQueue] Job ${jobId} Success`);
    } catch (error) {
      console.error(`[UploadQueue] Job ${jobId} Failed`, error);
      store.dispatch(uploadFailure({ id: jobId }));
    }
  };

  /**
   * Public API to start the queue.
   * Call this when:
   * 1. A new video is recorded.
   * 2. The app comes to the Foreground.
   */
  public start = async () => {
    if (this.isRunning) return;

    const state = store.getState();
    const queueLen = state.upload.queue.length;

    if (queueLen === 0) return; // Nothing to do

    this.isRunning = true;

    const options = {
      taskName: "UploadQueue",
      taskTitle: "Uploading Video Notes",
      taskDesc: "Syncing your vibes...",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#ff00ff",
      parameters: {
        delay: 1000,
      },
    };

    try {
      await BackgroundService.start(this.backgroundTask, options);
    } catch (e) {
      console.log("Error starting background service", e);
      this.isRunning = false;
    }
  };

  public stop = async () => {
    await BackgroundService.stop();
    this.isRunning = false;
  };
}

export default UploadQueueManager.getInstance();
