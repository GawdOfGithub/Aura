import { useCallback, useState } from "react";
import type { Face } from "react-native-vision-camera-face-detector";

interface CircleBounds {
  centerX: number;
  centerY: number;
  radius: number;
}

export interface FaceValidationState {
  isValid: boolean;
  message: string;
  faceCount: number;
}
interface UseFaceValidationProps {
  circleBounds: CircleBounds;
  screenWidth: number;
  screenHeight: number;
}

function convertToScreenCoordinates(
  face: Face,
  frameWidth: number,
  frameHeight: number,
  screenWidth: number,
  screenHeight: number,
  isFrontCamera = true,
) {
  const { bounds } = face;
  const isScreenPortrait = screenHeight > screenWidth;
  const isFrameLandscape = frameWidth > frameHeight;
  const needsRotation = isScreenPortrait && isFrameLandscape;

  const effectiveFrameWidth = needsRotation ? frameHeight : frameWidth;
  const effectiveFrameHeight = needsRotation ? frameWidth : frameHeight;

  let effectiveBoundsX = bounds.x;
  let effectiveBoundsY = bounds.y;
  let effectiveBoundsWidth = bounds.width;
  let effectiveBoundsHeight = bounds.height;

  if (needsRotation) {
    effectiveBoundsX = frameHeight - bounds.y - bounds.height;
    effectiveBoundsY = bounds.x;
    effectiveBoundsWidth = bounds.height;
    effectiveBoundsHeight = bounds.width;
  }

  const frameAspect = effectiveFrameWidth / effectiveFrameHeight;
  const screenAspect = screenWidth / screenHeight;
  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (frameAspect > screenAspect) {
    scale = screenHeight / effectiveFrameHeight;
    offsetX = (effectiveFrameWidth * scale - screenWidth) / 2;
  } else {
    scale = screenWidth / effectiveFrameWidth;
    offsetY = (effectiveFrameHeight * scale - screenHeight) / 2;
  }

  let faceLeft = effectiveBoundsX * scale - offsetX;
  const faceTop = effectiveBoundsY * scale - offsetY;
  const faceWidth = effectiveBoundsWidth * scale;
  const faceHeight = effectiveBoundsHeight * scale;

  if (isFrontCamera) {
    faceLeft = screenWidth - faceLeft - faceWidth;
  }

  return {
    left: faceLeft,
    top: faceTop,
    right: faceLeft + faceWidth,
    bottom: faceTop + faceHeight,
    centerX: faceLeft + faceWidth / 2,
    centerY: faceTop + faceHeight / 2,
  };
}

export const useFaceValidation = ({
  circleBounds,
  screenWidth,
  screenHeight,
}: UseFaceValidationProps) => {
  const [validationState, setValidationState] = useState<FaceValidationState>({
    isValid: false,
    message: "Position your face in the circle",
    faceCount: 0,
  });

  const validateFace = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      if (faces.length === 0) {
        setValidationState({
          isValid: false,
          message: "No face detected",
          faceCount: 0,
        });
        return;
      }

      if (faces.length > 1) {
        setValidationState({
          isValid: false,
          message: "Multiple faces detected. Only one face allowed.",
          faceCount: faces.length,
        });
        return;
      }

      const screenFace = convertToScreenCoordinates(
        faces[0],
        frameWidth,
        frameHeight,
        screenWidth,
        screenHeight,
        true,
      );

      const { centerX, centerY, radius } = circleBounds;
      const faceWidth = screenFace.right - screenFace.left;
      const circleDiameter = radius * 2;

      // CONTOUR-BASED VALIDATION
      // Get face contour points and check if ALL are within circle
      const face = faces[0];
      const faceContour = face.contours?.FACE;

      let allPointsInside = true;
      let maxDistance = 0;

      if (faceContour && faceContour.length > 0) {
        // Convert each contour point to screen coordinates and check distance
        for (const point of faceContour) {
          // Apply same coordinate transformation as bounds
          const isScreenPortrait = screenHeight > screenWidth;
          const isFrameLandscape = frameWidth > frameHeight;
          const needsRotation = isScreenPortrait && isFrameLandscape;

          const effectiveFrameWidth = needsRotation ? frameHeight : frameWidth;
          const effectiveFrameHeight = needsRotation ? frameWidth : frameHeight;

          let px = point.x;
          let py = point.y;

          if (needsRotation) {
            const temp = px;
            px = frameHeight - py;
            py = temp;
          }

          const frameAspect = effectiveFrameWidth / effectiveFrameHeight;
          const screenAspect = screenWidth / screenHeight;
          let scale: number;
          let offsetX = 0;
          let offsetY = 0;

          if (frameAspect > screenAspect) {
            scale = screenHeight / effectiveFrameHeight;
            offsetX = (effectiveFrameWidth * scale - screenWidth) / 2;
          } else {
            scale = screenWidth / effectiveFrameWidth;
            offsetY = (effectiveFrameHeight * scale - screenHeight) / 2;
          }

          let screenX = px * scale - offsetX;
          const screenY = py * scale - offsetY;

          // Front camera mirroring
          screenX = screenWidth - screenX;

          // Calculate distance from circle center
          const distance = Math.sqrt(
            Math.pow(screenX - centerX, 2) + Math.pow(screenY - centerY, 2),
          );

          maxDistance = Math.max(maxDistance, distance);

          const toleranceTopLeft = 0.8;
          const toleranceTopRight = 1.2;
          const toleranceBottomLeft = 1.3;
          const toleranceBottomRight = 1.3;

          // Determine which quadrant the point is in (only ONE will be true)
          const isTopLeft = screenY < centerY && screenX < centerX;
          const isTopRight = screenY < centerY && screenX >= centerX;
          const isBottomLeft = screenY >= centerY && screenX < centerX;
          const isBottomRight = screenY >= centerY && screenX >= centerX;

          // Select tolerance based on quadrant
          const tolerance = isTopLeft
            ? toleranceTopLeft
            : isTopRight
              ? toleranceTopRight
              : isBottomLeft
                ? toleranceBottomLeft
                : toleranceBottomRight;

          console.log(
            "Quadrant:",
            isTopLeft
              ? "TopLeft"
              : isTopRight
                ? "TopRight"
                : isBottomLeft
                  ? "BottomLeft"
                  : "BottomRight",
            "Tolerance:",
            tolerance,
          );

          if (distance > radius * tolerance) {
            allPointsInside = false;
          }
        }
      } else {
        // Fallback to bounding box if no contours available
        const corners = [
          { x: screenFace.left, y: screenFace.top },
          { x: screenFace.right, y: screenFace.top },
          { x: screenFace.left, y: screenFace.bottom },
          { x: screenFace.right, y: screenFace.bottom },
        ];

        for (const corner of corners) {
          const distance = Math.sqrt(
            Math.pow(corner.x - centerX, 2) + Math.pow(corner.y - centerY, 2),
          );
          maxDistance = Math.max(maxDistance, distance);
          if (distance > radius * 1.02) {
            allPointsInside = false;
          }
        }
      }

      // Check face size relative to circle
      const isTooSmall = faceWidth < circleDiameter * 0.15;
      const isTooLarge = faceWidth > circleDiameter * 0.95;

      // Validation logic
      if (isTooSmall) {
        setValidationState({
          isValid: false,
          message: "Move closer",
          faceCount: 1,
        });
        return;
      }

      if (isTooLarge) {
        setValidationState({
          isValid: false,
          message: "Move back a little",
          faceCount: 1,
        });
        return;
      }

      if (allPointsInside) {
        setValidationState({
          isValid: true,
          message: "Perfect! Ready to capture",
          faceCount: 1,
        });
        return;
      }

      // Face outside circle
      setValidationState({
        isValid: false,
        message: "Get your face inside the circle",
        faceCount: 1,
      });
    },
    [circleBounds, screenWidth, screenHeight],
  );

  return { validationState, validateFace };
};
