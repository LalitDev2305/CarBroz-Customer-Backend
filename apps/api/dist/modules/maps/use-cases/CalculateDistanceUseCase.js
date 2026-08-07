export class CalculateDistanceUseCase {
    mapsProvider;
    constructor(mapsProvider) {
        this.mapsProvider = mapsProvider;
    }
    async execute(input) {
        return this.mapsProvider.calculateDistance({ latitude: input.data.originLat, longitude: input.data.originLng }, { latitude: input.data.destLat, longitude: input.data.destLng });
    }
}
//# sourceMappingURL=CalculateDistanceUseCase.js.map