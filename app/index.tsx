import React, { useState } from "react";

import { CameraRecorderScreen } from "./cameraSceen";
import { VideoPreviewScreen } from "./videoPreviewScreen";

const HomeScreen = () => {
  const [videoPath, setVideoPath] = useState<string | null>(null);

  const handleVideoCaptured = (path: string) => {
    setVideoPath(path); // This switches the view to the player
  };

  const handleRetake = () => {
    setVideoPath(null); // This switches back to the camera
  };

  if (videoPath) {
    return <VideoPreviewScreen path={videoPath} onRetake={handleRetake} />;
  }

  return <CameraRecorderScreen onVideoCaptured={handleVideoCaptured} />;
};

export default HomeScreen;
