
import useBackgroundRemoval from '@/hooks/BackgroundRemovalResult';
import { normalizeFileUri } from '@/utilities/filePathNormalization';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
    Camera,
    CameraPosition,
    useCameraDevice,
    useCameraPermission,
} from 'react-native-vision-camera';
import { StickerImage } from './components/StickerImage';

export const CameraTestScreen = () => {
    const [camPosition, setCamPosition] = useState<CameraPosition>('front');
    const device = useCameraDevice(camPosition);
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<Camera>(null);

    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);


    const { processedUri: processedImage, isProcessing, error: bgRemovalError } = useBackgroundRemoval(capturedPhoto);
    const [captureError, setCaptureError] = useState<string | null>(null);
    const error = bgRemovalError || captureError;

    React.useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    const takePhoto = async () => {
        if (!camera.current) return;

        try {
            setCaptureError(null);
            setCapturedPhoto(null);


            const photo = await camera.current.takePhoto();

            const photoUri = normalizeFileUri(photo.path);
            setCapturedPhoto(photoUri);
        } catch (err) {
            console.error('Error capturing photo:', err);
            setCaptureError('Failed to capture photo');
        }
    };

    const resetCamera = () => {
        setCapturedPhoto(null);
        setCaptureError(null);
    };

    const toggleCamera = () => {
        setCamPosition((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Camera permission is required</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera device found</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.container}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Camera Test</Text>
                        <Text style={styles.headerSubtitle}>Background Removal</Text>
                    </View>

                    <View style={styles.cameraContainer}>
                        {!capturedPhoto ? (
                            <>
                                <Camera
                                    ref={camera}
                                    style={StyleSheet.absoluteFill}
                                    device={device}
                                    isActive={true}
                                    photo={true}
                                />
                                <TouchableOpacity
                                    style={styles.flipButton}
                                    onPress={toggleCamera}
                                >
                                    <Text style={styles.flipButtonText}>🔄</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.previewImageContainer}>
                                {processedImage ? (
                                    <StickerImage
                                        source={{ uri: processedImage }}
                                    />

                                ) : (
                                    <Image
                                        source={{ uri: capturedPhoto }}
                                        style={[
                                            {
                                                flex: 1,
                                                width: "100%",
                                            }
                                        ]}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                        )}
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.controls}>
                        {isProcessing ? (
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color="#e94560" />
                                <Text style={styles.processingText}>Removing background...</Text>
                            </View>
                        ) : !capturedPhoto ? (
                            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.resetButton]}
                                onPress={resetCamera}
                            >
                                <Text style={styles.buttonText}>Retake</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 20,
    },
    permissionText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#e94560',
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
    },
    cameraContainer: {
        width: Dimensions.get('window').width - 32,
        height: Dimensions.get('window').width - 32,
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',

    },
    previewImageContainer: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',

    },
    previewImage: {
        flex: 1,
        borderColor: '#e94560',
        borderWidth: 2,
        marginTop: 20
    },
    borderOuter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        borderWidth: 5,
        borderColor: '#fff',
        pointerEvents: 'none',
    },
    borderInner: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
        borderRadius: 15,
        borderWidth: 4,
        borderColor: '#fff',
        pointerEvents: 'none',
    },

    flipButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flipButtonText: {
        fontSize: 24,
    },
    errorContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    errorText: {
        color: '#ff6b6b',
        textAlign: 'center',
        fontSize: 14,
    },
    controls: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: '#4a4e69',
    },
    removeButton: {
        backgroundColor: '#e94560',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    processingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5

    },
    processingText: {
        color: '#aaa',
        fontSize: 14,

    },
});

export default CameraTestScreen;