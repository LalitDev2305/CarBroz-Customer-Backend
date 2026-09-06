/** ServiceSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ServiceSnapshot {
  serviceId: number;
  name: string;
  categoryName?: string;
  basePricePaise: number;
  estimatedDurationMinutes: number;
}

/** AddonSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddonSnapshot {
  addonId: number;
  name: string;
  pricePaise: number;
}

/** PriceSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PriceSnapshot {
  basePricePaise: number;
  addonsTotalPaise: number;
  vehicleMultiplier: number;
  subtotalPaise: number;
  taxesPaise: number;
  totalPricePaise: number;
}

/** AddressSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddressSnapshot {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

/** VehicleSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface VehicleSnapshot {
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  registrationNumber: string;
  fuelType: string;
}

/** BookingSnapshots is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface BookingSnapshots {
  service: ServiceSnapshot;
  addons: AddonSnapshot[];
  pricing: PriceSnapshot;
  address: AddressSnapshot;
  vehicle: VehicleSnapshot;
}
