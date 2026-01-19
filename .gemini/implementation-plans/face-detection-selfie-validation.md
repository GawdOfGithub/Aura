# Face Detection for Selfie Validation - Implementation Plan

## 🎯 Objective

Implement a feature that detects if the user's face is completely inside a circular area while taking a selfie. If the face is not fully within the circle, prevent the selfie and display a prompt message.

---

## 📚 Recommended Libraries

### Primary Recommendation: **react-native-vision-camera** + **Google MLKit Face Detection**

Since you're already using `react-native-vision-camera` (v4.7.3), the best approach is to use the **Frame Processor** feature with the **MLKit Face Detection** plugin.

#### Required Packages:

| Package                                    | Purpose                                      | Install Command                                        |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| `react-native-vision-camera-face-detector` | MLKit-based face detection for Vision Camera | `npm install react-native-vision-camera-face-detector` |
| `react-native-worklets-core`               | Required for frame processor worklets        | Already have `react-native-worklets`                   |

**Why this approach?**

- ✅ **Seamless integration** - Works directly with your existing `react-native-vision-camera` setup
- ✅ **Real-time processing** - Runs at 30fps with minimal latency
- ✅ **Native performance** - Uses native MLKit (Android) / Vision (iOS)
- ✅ **Face bounding box** - Returns precise face coordinates to check against circle area
- ✅ **No server calls** - All processing happens on-device

### Alternative Options (Not Recommended for your case):

| Library                        | Pros                     | Cons                                          |
| ------------------------------ | ------------------------ | --------------------------------------------- |
| `expo-face-detector`           | Expo-managed, simple API | Deprecated by Expo, less accurate             |
| `@tensorflow/tfjs` + BlazeFace | Cross-platform ML        | Heavy bundle size, slower performance         |
| `react-native-ml-kit`          | Google MLKit wrapper     | More setup, not integrated with Vision Camera |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SelfieScreen Component                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Vision Camera                        │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │           Frame Processor                        │ │   │
│  │  │  ┌─────────────────────────────────────────┐    │ │   │
│  │  │  │     Face Detection (MLKit)              │    │ │   │
│  │  │  │  - Detect face bounding box              │    │ │   │
│  │  │  │  - Return face coordinates               │    │ │   │
│  │  │  └─────────────────────────────────────────┘    │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              useFaceValidation Hook                   │   │
│  │  - Check if face is within circle bounds              │   │
│  │  - Update validation state                            │   │
│  │  - Handle edge cases (no face, multiple faces)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                UI Components                          │   │
│  │  - Circle overlay (SVG/Canvas)                        │   │
│  │  - Warning message                                    │   │
│  │  - Capture button (enabled/disabled)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Implementation Workflow

### Phase 1: Setup & Dependencies (30 mins)

#### Step 1.1: Install Face Detection Plugin

```bash
npm install react-native-vision-camera-face-detector
```

#### Step 1.2: Rebuild Native Apps

```bash
# For Android
npx expo run:android

# For iOS (if applicable)
cd ios && pod install && cd ..
npx expo run:ios
```

#### Step 1.3: Configure Babel (if not already)

Ensure `react-native-reanimated/plugin` is in your `babel.config.js`:

```javascript
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: ["react-native-reanimated/plugin"],
};
```

---

### Phase 2: Create Face Validation Hook (1 hour)

#### Step 2.1: Create the Hook File

Create `/home/anurag/video-chat-practice/app/hooks/useFaceValidation.ts`

```typescript
import { useCallback, useState } from "react";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import type { Face } from "react-native-vision-camera-face-detector";

interface CircleBounds {
  centerX: number;
  centerY: number;
  radius: number;
}

interface FaceValidationState {
  isValid: boolean;
  message: string;
  faceCount: number;
}

interface UseFaceValidationProps {
  circleBounds: CircleBounds;
  frameWidth: number;
  frameHeight: number;
}

export const useFaceValidation = ({
  circleBounds,
  frameWidth,
  frameHeight,
}: UseFaceValidationProps) => {
  const [validationState, setValidationState] = useState<FaceValidationState>({
    isValid: false,
    message: "Position your face in the circle",
    faceCount: 0,
  });

  const validateFace = useCallback(
    (faces: Face[]) => {
      // No face detected
      if (faces.length === 0) {
        setValidationState({
          isValid: false,
          message: "No face detected",
          faceCount: 0,
        });
        return;
      }

      // Multiple faces detected
      if (faces.length > 1) {
        setValidationState({
          isValid: false,
          message: "Multiple faces detected. Only one face allowed.",
          faceCount: faces.length,
        });
        return;
      }

      const face = faces[0];
      const { bounds } = face;

      // Convert face bounds to screen coordinates (may need adjustment based on camera orientation)
      const faceLeft = bounds.x;
      const faceTop = bounds.y;
      const faceRight = bounds.x + bounds.width;
      const faceBottom = bounds.y + bounds.height;
      const faceCenterX = faceLeft + bounds.width / 2;
      const faceCenterY = faceTop + bounds.height / 2;

      // Circle bounds
      const { centerX, centerY, radius } = circleBounds;

      // Check if all four corners of face bounding box are within the circle
      const corners = [
        { x: faceLeft, y: faceTop },
        { x: faceRight, y: faceTop },
        { x: faceLeft, y: faceBottom },
        { x: faceRight, y: faceBottom },
      ];

      const allCornersInside = corners.every((corner) => {
        const distance = Math.sqrt(
          Math.pow(corner.x - centerX, 2) + Math.pow(corner.y - centerY, 2),
        );
        return distance <= radius;
      });

      if (allCornersInside) {
        setValidationState({
          isValid: true,
          message: "Perfect! Ready to capture",
          faceCount: 1,
        });
      } else {
        // Provide directional guidance
        let message = "Move your face ";
        const directions: string[] = [];

        if (faceCenterX < centerX - radius * 0.2) directions.push("right");
        if (faceCenterX > centerX + radius * 0.2) directions.push("left");
        if (faceCenterY < centerY - radius * 0.2) directions.push("down");
        if (faceCenterY > centerY + radius * 0.2) directions.push("up");

        if (directions.length === 0) {
          // Face is centered but too large
          message = "Move back a little";
        } else {
          message += directions.join(" and ");
        }

        setValidationState({
          isValid: false,
          message,
          faceCount: 1,
        });
      }
    },
    [circleBounds],
  );

  return {
    validationState,
    validateFace,
  };
};
```

---

### Phase 3: Create Frame Processor (45 mins)

#### Step 3.1: Create Frame Processor Worklet

Create `/home/anurag/video-chat-practice/app/utils/faceDetectionProcessor.ts`

```typescript
import { Frame } from "react-native-vision-camera";
import { detectFaces } from "react-native-vision-camera-face-detector";

export const createFaceDetectionProcessor = () => {
  "worklet";

  return (frame: Frame) => {
    "worklet";

    const faces = detectFaces(frame, {
      performanceMode: "fast",
      contourMode: "none", // We don't need facial contours
      landmarkMode: "none", // We don't need landmarks
      classificationMode: "none", // We don't need smile/eyes detection
    });

    return faces;
  };
};
```

---

### Phase 4: Create Selfie Circle Overlay Component (45 mins)

#### Step 4.1: Create Circle Overlay

Create `/home/anurag/video-chat-practice/app/components/SelfieCameraComponents/CircleOverlay.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_RADIUS = SCREEN_WIDTH * 0.4; // 40% of screen width
const CIRCLE_CENTER_X = SCREEN_WIDTH / 2;
const CIRCLE_CENTER_Y = SCREEN_HEIGHT * 0.35; // Slightly above center

interface CircleOverlayProps {
  isValid: boolean;
  message: string;
}

export const CircleOverlay: React.FC<CircleOverlayProps> = ({
  isValid,
  message,
}) => {
  const borderColor = isValid ? '#4ADE80' : '#EF4444'; // Green or Red

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* SVG Mask to create "hole" effect */}
      <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH}>
        <Defs>
          <Mask id="mask">
            <Rect x="0" y="0" width="100%" height="100%" fill="white" />
            <Circle
              cx={CIRCLE_CENTER_X}
              cy={CIRCLE_CENTER_Y}
              r={CIRCLE_RADIUS}
              fill="black"
            />
          </Mask>
        </Defs>

        {/* Semi-transparent overlay with circle cutout */}
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#mask)"
        />

        {/* Circle border */}
        <Circle
          cx={CIRCLE_CENTER_X}
          cy={CIRCLE_CENTER_Y}
          r={CIRCLE_RADIUS}
          fill="transparent"
          stroke={borderColor}
          strokeWidth={4}
        />
      </Svg>

      {/* Message overlay */}
      <View style={styles.messageContainer}>
        <View style={[styles.messageBubble, { backgroundColor: isValid ? 'rgba(74, 222, 128, 0.9)' : 'rgba(239, 68, 68, 0.9)' }]}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

export const CIRCLE_BOUNDS = {
  centerX: CIRCLE_CENTER_X,
  centerY: CIRCLE_CENTER_Y,
  radius: CIRCLE_RADIUS,
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  messageBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

### Phase 5: Create Selfie Camera Screen (1 hour)

#### Step 5.1: Create the Main Selfie Screen

Create `/home/anurag/video-chat-practice/app/screens/SelfieCameraScreen.tsx`

```typescript
import React, { useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { detectFaces, Face } from 'react-native-vision-camera-face-detector';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { CircleOverlay, CIRCLE_BOUNDS } from '../components/SelfieCameraComponents/CircleOverlay';
import { useFaceValidation } from '../hooks/useFaceValidation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SelfieCameraScreen: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Face validation hook
  const { validationState, validateFace } = useFaceValidation({
    circleBounds: CIRCLE_BOUNDS,
    frameWidth: SCREEN_WIDTH,
    frameHeight: SCREEN_HEIGHT,
  });

  // Frame processor for face detection
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    const faces = detectFaces(frame, {
      performanceMode: 'fast',
      contourMode: 'none',
      landmarkMode: 'none',
      classificationMode: 'none',
    });

    // Pass faces to validation logic on JS thread
    runOnJS(validateFace)(faces);
  }, [validateFace]);

  // Capture photo handler
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !validationState.isValid) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });

      console.log('Photo captured:', photo.path);
      // Handle the captured photo (navigate to preview, upload, etc.)
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  }, [validationState.isValid]);

  // Request permission if not granted
  if (!hasPermission) {
    requestPermission();
    return null;
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No front camera available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={10} // 10fps is enough for face detection
      />

      {/* Circle overlay with validation feedback */}
      <CircleOverlay
        isValid={validationState.isValid}
        message={validationState.message}
      />

      {/* Capture button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            !validationState.isValid && styles.captureButtonDisabled,
          ]}
          onPress={handleCapture}
          disabled={!validationState.isValid}
        >
          <View
            style={[
              styles.captureButtonInner,
              validationState.isValid && styles.captureButtonInnerActive,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  captureButtonInnerActive: {
    backgroundColor: '#4ADE80',
  },
});

export default SelfieCameraScreen;
```

---

### Phase 6: Integration & Testing (30 mins)

#### Step 6.1: Add Screen to Navigation

Update your navigation configuration to include the `SelfieCameraScreen`.

#### Step 6.2: Test on Physical Device

```bash
npx expo run:android
# or
npx expo run:ios
```

> ⚠️ **Important**: Face detection requires a physical device. It will NOT work on emulators/simulators.

---

## 🔧 Coordinate System Adjustment

The face detector returns coordinates relative to the camera frame, which may need to be converted to screen coordinates. The conversion depends on:

1. **Camera orientation** (portrait/landscape)
2. **Camera mirroring** (front camera is mirrored)
3. **Frame vs Screen resolution**

Add this utility function to handle coordinate conversion:

```typescript
// app/utils/coordinateConverter.ts
interface ConversionParams {
  faceX: number;
  faceY: number;
  faceWidth: number;
  faceHeight: number;
  frameWidth: number;
  frameHeight: number;
  screenWidth: number;
  screenHeight: number;
  isFrontCamera: boolean;
}

export const convertFaceToScreenCoordinates = ({
  faceX,
  faceY,
  faceWidth,
  faceHeight,
  frameWidth,
  frameHeight,
  screenWidth,
  screenHeight,
  isFrontCamera,
}: ConversionParams) => {
  // Scale factors
  const scaleX = screenWidth / frameWidth;
  const scaleY = screenHeight / frameHeight;

  // Convert coordinates
  let screenX = faceX * scaleX;
  let screenY = faceY * scaleY;
  const screenFaceWidth = faceWidth * scaleX;
  const screenFaceHeight = faceHeight * scaleY;

  // Mirror for front camera
  if (isFrontCamera) {
    screenX = screenWidth - screenX - screenFaceWidth;
  }

  return {
    x: screenX,
    y: screenY,
    width: screenFaceWidth,
    height: screenFaceHeight,
  };
};
```

---

## 📁 Final File Structure

```
app/
├── hooks/
│   └── useFaceValidation.ts          # NEW - Face validation logic
├── utils/
│   └── coordinateConverter.ts         # NEW - Coordinate conversion
├── components/
│   └── SelfieCameraComponents/
│       └── CircleOverlay.tsx          # NEW - Circle overlay UI
├── screens/
│   └── SelfieCameraScreen.tsx         # NEW - Main selfie screen
```

---

## ⏱️ Estimated Time

| Phase     | Task                     | Time           |
| --------- | ------------------------ | -------------- |
| 1         | Setup & Dependencies     | 30 mins        |
| 2         | Face Validation Hook     | 1 hour         |
| 3         | Frame Processor          | 45 mins        |
| 4         | Circle Overlay Component | 45 mins        |
| 5         | Selfie Camera Screen     | 1 hour         |
| 6         | Integration & Testing    | 30 mins        |
| **Total** |                          | **~4.5 hours** |

---

## 🚨 Potential Issues & Solutions

| Issue                         | Solution                                       |
| ----------------------------- | ---------------------------------------------- |
| Face detection lag            | Reduce `frameProcessorFps` to 5-10             |
| Coordinates mismatch          | Adjust coordinate conversion logic             |
| Frame processor crashes       | Ensure worklets plugin is properly configured  |
| Front camera mirroring        | Apply horizontal flip in coordinate conversion |
| Multiple faces false positive | Add debounce to validation state updates       |

---

## 🎯 Success Criteria

- [ ] Face detection works in real-time (< 100ms latency)
- [ ] Circle overlay displays correctly with cutout effect
- [ ] Validation message updates based on face position
- [ ] Capture button is disabled when face is outside circle
- [ ] Directional guidance helps user position their face
- [ ] Works on both Android and iOS physical devices

---

## 📚 References

- [react-native-vision-camera Docs](https://mrousavy.github.io/react-native-vision-camera/)
- [react-native-vision-camera-face-detector](https://github.com/nonam4/react-native-vision-camera-face-detector)
- [Frame Processor Guide](https://mrousavy.github.io/react-native-vision-camera/docs/guides/frame-processors)
