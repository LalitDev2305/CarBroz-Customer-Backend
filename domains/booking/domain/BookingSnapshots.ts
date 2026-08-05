export interface ServiceSnapshot {
  serviceId: number;
  name: string;
  categoryName?: string;
  basePricePaise: number;
  estimatedDurationMinutes: number;
}

export interface AddonSnapshot {
  addonId: number;
  name: string;
  pricePaise: number;
}

export interface PriceSnapshot {
  basePricePaise: number;
  addonsTotalPaise: number;
  vehicleMultiplier: number;
  subtotalPaise: number;
  taxesPaise: number;
  totalPricePaise: number;
}

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

export interface VehicleSnapshot {
  make: string;
  model: string;
  variant?: string | null;
  year: number;
  registrationNumber: string;
  fuelType: string;
}

export interface BookingSnapshots {
  service: ServiceSnapshot;
  addons: AddonSnapshot[];
  pricing: PriceSnapshot;
  address: AddressSnapshot;
  vehicle: VehicleSnapshot;
}
