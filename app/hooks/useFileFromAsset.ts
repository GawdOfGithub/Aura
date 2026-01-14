import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

/**
 * Downloads a bundled asset (require) to a local cache file 
 * and returns the local file URI.
 */
export const useFileFromAsset = (assetSource: any, fileName: string = "temp.mp4") => {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const asset = Asset.fromModule(assetSource);
        
        await asset.downloadAsync(); 
        const targetUri = `${FileSystem.cacheDirectory}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(targetUri);
        
        if (!fileInfo.exists) {
   
          await FileSystem.downloadAsync(asset.uri, targetUri);
        }

        setLocalUri(targetUri);
      } catch (error) {
        console.error("Error moving asset to filesystem:", error);
      }
    };

    if (assetSource) {
      loadFile();
    }
  }, [assetSource, fileName]);

  return localUri;
};