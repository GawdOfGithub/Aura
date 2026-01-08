const { withAndroidManifest } = require('@expo/config-plugins');


const withMergedMlKitDependencies = (config) => {
    return withAndroidManifest(config, async (config) => {
        const mainApplication = config.modResults.manifest.application?.[0];

        if (!mainApplication) {
            return config;
        }

        // Initialize meta-data array if it doesn't exist
        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        // Find existing ML Kit dependencies entry or create one
        const mlKitKey = 'com.google.mlkit.vision.DEPENDENCIES';
        let mlKitEntry = mainApplication['meta-data'].find(
            (item) => item.$?.['android:name'] === mlKitKey
        );

        // Merge dependencies - include both subject_segment and barcode_ui
        const mergedDependencies = 'subject_segment,barcode_ui';

        if (mlKitEntry) {
            // Update existing entry with merged value
            mlKitEntry.$['android:value'] = mergedDependencies;
            mlKitEntry.$['tools:replace'] = 'android:value';
        } else {
            // Add new entry
            mainApplication['meta-data'].push({
                $: {
                    'android:name': mlKitKey,
                    'android:value': mergedDependencies,
                    'tools:replace': 'android:value',
                },
            });
        }

        // Ensure tools namespace is declared
        if (!config.modResults.manifest.$['xmlns:tools']) {
            config.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        return config;
    });
};

module.exports = withMergedMlKitDependencies;
