export class ReverseGeocodeUseCase {
    mapsProvider;
    constructor(mapsProvider) {
        this.mapsProvider = mapsProvider;
    }
    async execute(input) {
        return this.mapsProvider.reverseGeocode({
            latitude: input.data.lat,
            longitude: input.data.lng
        });
    }
}
//# sourceMappingURL=ReverseGeocodeUseCase.js.map