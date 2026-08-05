import {
  Booking,
  BookingSnapshots,
  IAddressRepository,
  IBookingRepository,
  ICatalogRepository,
  ICustomerProfileRepository,
  IPricingRepository,
  ITransactionProvider,
  IVehicleRepository,
  ServiceAddon,
} from '@carbroz/common';

export interface CreateBookingInput {
  customerId: number;
  vehicleId: number;
  addressId: number;
  serviceId: number;
  addonIds?: number[];
  slotStartTime: Date;
  slotEndTime: Date;
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly catalogRepository: ICatalogRepository,
    private readonly pricingRepository: IPricingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
    private readonly transactionProvider: ITransactionProvider
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    const now = new Date();
    if (new Date(input.slotStartTime) <= now) {
      throw new Error('Slot start time must be in the future');
    }
    if (new Date(input.slotEndTime) <= new Date(input.slotStartTime)) {
      throw new Error('Slot end time must be after slot start time');
    }

    const vehicle = await this.vehicleRepository.findById(input.vehicleId);
    if (!vehicle || vehicle.customerId !== input.customerId || !vehicle.isBookable()) {
      throw new Error('Invalid or non-bookable vehicle');
    }

    const address = await this.addressRepository.findById(input.addressId);
    if (!address) {
      throw new Error('Address not found');
    }

    const service = await this.catalogRepository.findServiceById(input.serviceId);
    if (!service || !service.isActive) {
      throw new Error('Service not found or inactive');
    }

    const conflicting = await this.bookingRepository.findConflictingSlotBooking(
      input.serviceId,
      new Date(input.slotStartTime),
      new Date(input.slotEndTime)
    );
    if (conflicting) {
      throw new Error('Selected service slot is no longer available');
    }

    // Pricing Calculation
    let basePricePaise = service.basePrice;
    const defaultTier = await this.pricingRepository.findDefaultTierByServiceId(input.serviceId);
    if (defaultTier) {
      basePricePaise = defaultTier.flatPrice;
    }

    const vehicleMultiplier = await this.pricingRepository.findVehicleMultiplier(input.serviceId, vehicle.fuelType);
    const multiplierValue = vehicleMultiplier ? vehicleMultiplier.multiplier : 1.0;

    let addonsTotalPaise = 0;
    const addonSnapshots = [];
    if (input.addonIds && input.addonIds.length > 0) {
      const activeAddons = await this.catalogRepository.findAddonsByServiceId(input.serviceId);
      for (const addonId of input.addonIds) {
        const found = activeAddons.find((a: ServiceAddon) => a.id === addonId && a.isActive);
        if (found) {
          addonsTotalPaise += found.price;
          addonSnapshots.push({
            addonId: found.id!,
            name: found.name,
            pricePaise: found.price,
          });
        }
      }
    }

    const subtotalPaise = Math.round(basePricePaise * multiplierValue) + addonsTotalPaise;
    const taxesPaise = Math.round(subtotalPaise * 0.18); // 18% GST standard
    const totalPricePaise = subtotalPaise + taxesPaise;

    const snapshots: BookingSnapshots = {
      service: {
        serviceId: service.id!,
        name: service.name,
        basePricePaise,
        estimatedDurationMinutes: service.estimatedDurationMinutes,
      },
      addons: addonSnapshots,
      pricing: {
        basePricePaise,
        addonsTotalPaise,
        vehicleMultiplier: multiplierValue,
        subtotalPaise,
        taxesPaise,
        totalPricePaise,
      },
      address: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
      },
    };

    const expiryAt = new Date(now.getTime() + 15 * 60 * 1000); // 15-minute slot hold

    const booking = new Booking({
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      addressId: input.addressId,
      serviceId: input.serviceId,
      status: 'CREATED',
      slotStartTime: new Date(input.slotStartTime),
      slotEndTime: new Date(input.slotEndTime),
      expiryAt,
      totalPricePaise,
      snapshots,
    });

    return await this.transactionProvider.runInTransaction(async () => {
      return await this.bookingRepository.create(booking);
    });
  }
}
