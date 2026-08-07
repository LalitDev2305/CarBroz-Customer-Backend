export class GetInitConfigUseCase {
    configProvider;
    featureFlagProvider;
    constructor(configProvider, featureFlagProvider) {
        this.configProvider = configProvider;
        this.featureFlagProvider = featureFlagProvider;
    }
    async execute() {
        const [maintenanceEnabled, maintenanceMessage, androidMin, androidLatest, iosMin, iosLatest, featureFlags,] = await Promise.all([
            this.configProvider.get('maintenance.enabled', 'false'),
            this.configProvider.get('maintenance.message', ''),
            this.configProvider.get('android.minVersion', '1.0.0'),
            this.configProvider.get('android.latestVersion', '1.0.0'),
            this.configProvider.get('ios.minVersion', '1.0.0'),
            this.configProvider.get('ios.latestVersion', '1.0.0'),
            this.featureFlagProvider.getAllFlags(),
        ]);
        return {
            maintenance: {
                enabled: maintenanceEnabled === 'true',
                message: maintenanceMessage,
            },
            forceUpdate: {
                android: {
                    minVersion: androidMin,
                    latestVersion: androidLatest,
                },
                ios: {
                    minVersion: iosMin,
                    latestVersion: iosLatest,
                },
            },
            featureFlags,
        };
    }
}
//# sourceMappingURL=GetInitConfigUseCase.js.map