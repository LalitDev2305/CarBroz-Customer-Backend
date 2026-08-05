export class LocationPing {
    latitude;
    longitude;
    heading;
    speed;
    timestamp;
    constructor(props) {
        if (props.latitude < -90 || props.latitude > 90) {
            throw new Error(`Invalid latitude coordinate: ${props.latitude}`);
        }
        if (props.longitude < -180 || props.longitude > 180) {
            throw new Error(`Invalid longitude coordinate: ${props.longitude}`);
        }
        this.latitude = props.latitude;
        this.longitude = props.longitude;
        this.heading = props.heading ?? null;
        this.speed = props.speed ?? null;
        this.timestamp = props.timestamp ?? new Date();
    }
    static create(latitude, longitude, heading, speed) {
        return new LocationPing({ latitude, longitude, heading, speed });
    }
    distanceToMeters(other) {
        const R = 6371000; // Earth's radius in meters
        const dLat = ((other.latitude - this.latitude) * Math.PI) / 180;
        const dLng = ((other.longitude - this.longitude) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((this.latitude * Math.PI) / 180) *
                Math.cos((other.latitude * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }
}
//# sourceMappingURL=LocationPing.js.map