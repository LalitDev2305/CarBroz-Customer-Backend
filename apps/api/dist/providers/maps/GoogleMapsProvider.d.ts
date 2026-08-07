import { IConfigProvider, IMapsProvider, Coordinates, GeocodeResult, DistanceMatrixResult, ILoggerProvider } from '@carbroz/foundation-kernel';
export declare class GoogleMapsProvider implements IMapsProvider {
    private readonly configProvider;
    private readonly logger;
    constructor(configProvider: IConfigProvider, logger: ILoggerProvider);
    init(): Promise<void>;
    shutdown(): Promise<void>;
    private isMockMode;
    geocode(address: string): Promise<GeocodeResult>;
    reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
    calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
