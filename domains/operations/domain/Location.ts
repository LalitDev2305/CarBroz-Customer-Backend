/** Coordinates is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** AddressComponent is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddressComponent {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

/** GeocodeResult is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface GeocodeResult {
  coordinates: Coordinates;
  address: AddressComponent;
}

/** DistanceMatrixResult is an exported domains/operations contract/implementation; see the owning README for lifecycle and extension rules. */
export interface DistanceMatrixResult {
  distanceInMeters: number;
  durationInSeconds: number;
}
