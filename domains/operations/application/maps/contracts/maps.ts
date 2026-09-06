export interface GeocodeRequest { address: string }
export interface ReverseGeocodeRequest { lat: number; lng: number }
export interface CalculateDistanceRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}
