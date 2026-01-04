const {
    AndroidConfig,
    createRunOncePlugin,
    withInfoPlist,
    withAndroidManifest,
} = require("@expo/config-plugins");

// The package info is needed for the plugin signature
const pkg = { name: "react-native-background-actions", version: "UNVERSIONED" };

const withBackgroundActions = (config) => {
    // ---------------------------------------------------------------------------
    // 1. iOS Configuration
    // ---------------------------------------------------------------------------
    config = withInfoPlist(config, (newConfig) => {
        if (!newConfig.modResults.BGTaskSchedulerPermittedIdentifiers) {
            newConfig.modResults.BGTaskSchedulerPermittedIdentifiers = [];
        }
        // Add the bundle identifier if it's not already there
        // This allows the task scheduler to identify your app
        if (
            !newConfig.modResults.BGTaskSchedulerPermittedIdentifiers.includes(
                "$(PRODUCT_BUNDLE_IDENTIFIER)"
            )
        ) {
            newConfig.modResults.BGTaskSchedulerPermittedIdentifiers.push(
                "$(PRODUCT_BUNDLE_IDENTIFIER)"
            );
        }
        return newConfig;
    });

    // ---------------------------------------------------------------------------
    // 2. Android Permissions
    // ---------------------------------------------------------------------------
    config = AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.WAKE_LOCK",
        // CRITICAL: Required for Android 14+ to prevent crashes during upload
        "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
    ]);

    // ---------------------------------------------------------------------------
    // 3. Android Manifest (Service Injection)
    // ---------------------------------------------------------------------------
    config = withAndroidManifest(config, (newConfig) => {
        const mainApplication = newConfig.modResults.manifest.application[0];
        const serviceName = "com.asterinet.react.bgactions.RNBackgroundActionsTask";

        // Ensure the service array exists
        if (!mainApplication.service) {
            mainApplication.service = [];
        }

        // CHECK: Does the service already exist? (Autolinking usually adds it)
        const existingService = mainApplication.service.find(
            (s) => s.$["android:name"] === serviceName
        );

        if (existingService) {

            existingService.$["android:foregroundServiceType"] = "dataSync";
        } else {

            mainApplication.service.push({
                $: {
                    "android:name": serviceName,
                    "android:foregroundServiceType": "dataSync",
                    "android:exported": "false", // Security best practice
                },
            });
        }

        return newConfig;
    });

    return config;
};

module.exports = createRunOncePlugin(
    withBackgroundActions,
    pkg.name,
    pkg.version
);