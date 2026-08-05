export class PricingTier {
  id?: number;
  publicId?: string;
  serviceId: number;
  name: string;
  flatPrice: number;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<PricingTier>) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.serviceId = data.serviceId!;
    this.name = data.name!;
    this.flatPrice = data.flatPrice ?? 0;
    this.isDefault = data.isDefault ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class VehicleTypeMultiplierEntity {
  id?: number;
  publicId?: string;
  serviceId: number;
  vehicleType: string;
  multiplier: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<VehicleTypeMultiplierEntity>) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.serviceId = data.serviceId!;
    this.vehicleType = data.vehicleType!;
    this.multiplier = data.multiplier ?? 1.0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
