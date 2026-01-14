import {
  Waveform,
  type IWaveformRef,
} from "@simform_solutions/react-native-audio-waveform";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, ViewStyle } from "react-native";

interface AudioWaveFormProps {
  source: string;
  height?: number;
  width?: number;
  waveColor?: string;
  scrubColor?: string;
  candleWidth?: number;
  candleSpace?: number;
  style?: ViewStyle;
  autoPlay?: boolean;
  loop?: boolean;
  onPlayerStateChange?: (playerState: any) => void;
  onPanStateChange?: (isMoving: boolean) => void;
}

const AudioWaveForm = forwardRef<IWaveformRef, AudioWaveFormProps>(
  (
    {
      source,
      waveColor = "#FFFFFF2B",
      scrubColor = "#ffffff",
      candleWidth = 2,
      candleSpace = 2,
      style,
      autoPlay = true,
      loop = true,
      onPlayerStateChange,
      onPanStateChange,
    },
    parentRef
  ) => {
    const localRef = useRef<IWaveformRef>(null);
    useImperativeHandle(parentRef, () => ({
      startPlayer: (args) =>
        localRef.current?.startPlayer(args) ?? Promise.resolve(false),

      stopPlayer: () =>
        localRef.current?.stopPlayer() ?? Promise.resolve(false),

      pausePlayer: () =>
        localRef.current?.pausePlayer() ?? Promise.resolve(false),

      resumePlayer: (args) =>
        localRef.current?.resumePlayer(args) ?? Promise.resolve(false),

      startRecord: (args) =>
        localRef.current?.startRecord(args) ?? Promise.resolve(false),

      stopRecord: () => localRef.current?.stopRecord() ?? Promise.resolve(""),

      pauseRecord: () =>
        localRef.current?.pauseRecord() ?? Promise.resolve(false),

      resumeRecord: () =>
        localRef.current?.resumeRecord() ?? Promise.resolve(false),

      // Getters for properties
      get currentState() {
        // Return a fallback state (like 'stopped') or cast as any if ref is null
        return localRef.current?.currentState as any;
      },

      get playerKey() {
        return localRef.current?.playerKey ?? "";
      },
    }));
    const handlePlayerStateChange = (playerState: any) => {
      // Log state to debug: 0=stopped, 1=playing, 2=paused (varies by OS/lib version)
      // Usually "stopped" means the track finished.

      if (loop && (playerState === "stopped" || playerState === 0)) {
        // Restart the player immediately
        localRef.current?.startPlayer();
      }
    };
    useEffect(() => {
      let isMounted = true;

      const timeout = setTimeout(() => {
        if (isMounted && autoPlay && source && localRef.current) {
          localRef.current.startPlayer({ finishMode: 2 });
        }
      }, 500);

      return () => {
        isMounted = false;
        clearTimeout(timeout);
        localRef.current?.stopPlayer();
      };
    }, [source, autoPlay]);
    if (!source) return null;

    return (
      <Waveform
        ref={localRef}
        mode="static"
        containerStyle={style}
        path={source}
        candleHeightScale={4}
        candleSpace={candleSpace}
        candleWidth={candleWidth}
        waveColor={waveColor}
        scrubColor={scrubColor}
        onPlayerStateChange={onPlayerStateChange}
        onPanStateChange={onPanStateChange}
      />
    );
  }
);

export default AudioWaveForm;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
