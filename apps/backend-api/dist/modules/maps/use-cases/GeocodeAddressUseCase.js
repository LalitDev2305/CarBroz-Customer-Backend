export class GeocodeAddressUseCase {
    mapsProvider;
    constructor(mapsProvider) {
        this.mapsProvider = mapsProvider;
    }
    async execute(input) {
        return this.mapsProvider.geocode(input.data.address);
    }
}
//# sourceMappingURL=GeocodeAddressUseCase.js.map