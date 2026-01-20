import { removeBackground } from '@six33/react-native-bg-removal';
import { useEffect, useState } from 'react';

interface BackgroundRemovalResultResult {
    processedUri: string | null;
    isProcessing: boolean;
    error: string | null;
}


export const useBackgroundRemoval = (imageUri: string | null): BackgroundRemovalResultResult => {
    const [processedUri, setProcessedUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!imageUri || imageUri.length === 0) {
            setProcessedUri(null);
            setError(null);
            return;
        }

        const processImage = async () => {
            setIsProcessing(true);
            setError(null);
            setProcessedUri(null);

            try {
                const resultUri = await removeBackground(imageUri, {
                    trim: false,
                } as any);

                setProcessedUri(resultUri);
            } catch (err) {
                console.error('Background removal failed:', err);
                setError('Failed to remove background');
            } finally {
                setIsProcessing(false);
            }
        };

        processImage();
    }, [imageUri]);

    return { processedUri, isProcessing, error };
};

export default useBackgroundRemoval;
