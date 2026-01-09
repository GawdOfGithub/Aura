import { handleUploadCompletion } from "@/app/store/features/upload/uploadThunk";
import { measureDuration } from "@/utilities/measureDuration";
import { compressVideoNative } from "@/utilities/videoCompressor";
import BackgroundService from "react-native-background-actions";
import { store } from "../../store";
import {
  compressionSuccess,
  getUploadConfigById,
  getUploadQueue,
  markUploading,
  selectItemById,
  selectNextJobId,
  uploadFailure,
  uploadSuccess,
} from "../../store/features/upload/uploadSlice";
import { performUpload } from "./uploadService";

const SLEEP_DELAY = 1000;

class UploadQueueManager {
  private static instance: UploadQueueManager;
  private isRunning: boolean = false;

  private constructor() { }

  public static getInstance(): UploadQueueManager {
    if (!UploadQueueManager.instance) {
      UploadQueueManager.instance = new UploadQueueManager();
    }
    return UploadQueueManager.instance;
  }

  /**
   * This function runs inside the Background Service.
   */
  private backgroundTask = async (taskDataArguments?: any) => {
    console.log("[UploadQueue] Service Started", BackgroundService.isRunning());

    // LOOP: Run as long as the service is allowed by OS
    while (BackgroundService.isRunning()) {
      const state = store.getState();
      const queue = getUploadQueue(state);
      const nextJobId = selectNextJobId(state);
      console.log("starting upload of jobID", queue, nextJobId)
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
    console.log("process upload of job id ", job)

    const config = getUploadConfigById(state, jobId);
    console.log("process upload of job ", job, config)
    if (!job || !config) return;
    if (!job.localUri) return;
    try {
      store.dispatch(markUploading(jobId));
      let uploadUri = job.localUri ?? "";
      if (!job.isCompressed) {
        // 1. Compress
        const { result: compressedUri, durationMs: compTime } = await measureDuration(() =>
          compressVideoNative(uploadUri)
        );

        console.log(`[UploadQueue] Compression took: ${compTime}ms`);
        // const compressedUri = await compressVideoNative(uploadUri);
        store.dispatch(compressionSuccess({ id: jobId, newUri: compressedUri }));
        uploadUri = compressedUri
      }

      // 2. Upload
      const { result: s3Key, durationMs: uploadTime } = await measureDuration<string>(() =>
        performUpload(uploadUri, config)
      );
      console.log(`[UploadQueue] Upload took: ${uploadTime}ms`);
      // const s3Key = await performUpload(uploadUri, config);

      // 3. Success Dispatch
      store.dispatch(uploadSuccess({ id: jobId, key: s3Key }));
      store.dispatch(handleUploadCompletion({
        localPath: job.localUri,
        fileKeyPath: s3Key
      }))
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
    console.log(queueLen)
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
      linkingURI: 'ab-uipl-app://',
      parameters: {
        delay: 1000,
      },
    };

    try {
      console.log("starting background server")
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
