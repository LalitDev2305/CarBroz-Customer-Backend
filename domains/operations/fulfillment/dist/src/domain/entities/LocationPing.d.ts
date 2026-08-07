export interface LocationPingProps {
    latitude: number;
    longitude: number;
    heading?: number | null;
    speed?: number | null;
    timestamp?: Date;
}
export declare class LocationPing {
    readonly latitude: number;
    readonly longitude: number;
    readonly heading: number | null;
    readonly speed: number | null;
    readonly timestamp: Date;
    constructor(props: LocationPingProps);
    static create(latitude: number, longitude: number, heading?: number, speed?: number): LocationPing;
    distanceToMeters(other: LocationPing): number;
}
