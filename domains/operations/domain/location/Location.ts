export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressComponent {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  address: AddressComponent;
}

export interface DistanceMatrixResult {
  distanceInMeters: number;
  durationInSeconds: number;
}
