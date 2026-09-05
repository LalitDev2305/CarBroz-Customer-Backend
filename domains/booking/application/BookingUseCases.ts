import { Booking, type BookingSnapshots } from '../domain/Booking.js';
import type { BookingStatus } from '../domain/BookingStatus.js';
import type { IBookingRepository } from '../domain/repositories/IBookingRepository.js';
import type { IAddressRepository, ICustomerProfileRepository, IVehicleRepository } from '@carbroz/domain-customer';
import type { ICatalogRepository, IPricingRepository, ServiceAddon } from '@carbroz/domain-catalog-pricing';
import type { IPartnerRepository } from '@carbroz/domain-partner';

export interface IBookingTransactionPort {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export interface IPayoutEligibilityPort {
  execute(bookingId: number): Promise<unknown>;
}

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
    private readonly transactionProvider: IBookingTransactionPort,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    void this.customerRepository;
    const now = new Date();
    if (new Date(input.slotStartTime) <= now) throw new Error('Slot start time must be in the future');
    if (new Date(input.slotEndTime) <= new Date(input.slotStartTime)) {
      throw new Error('Slot end time must be after slot start time');
    }

    const vehicle = await this.vehicleRepository.findById(input.vehicleId);
    if (!vehicle || vehicle.customerId !== input.customerId || !vehicle.isBookable()) {
      throw new Error('Invalid or non-bookable vehicle');
    }

    const address = await this.addressRepository.findById(input.addressId);
    if (!address) throw new Error('Address not found');

    const service = await this.catalogRepository.findServiceById(input.serviceId);
    if (!service || !service.isActive) throw new Error('Service not found or inactive');

    const conflicting = await this.bookingRepository.findConflictingSlotBooking(
      input.serviceId,
      new Date(input.slotStartTime),
      new Date(input.slotEndTime),
    );
    if (conflicting) throw new Error('Selected service slot is no longer available');

    let basePricePaise = service.basePrice;
    const defaultTier = await this.pricingRepository.findDefaultTierByServiceId(input.serviceId);
    if (defaultTier) basePricePaise = defaultTier.flatPrice;

    const vehicleMultiplier = await this.pricingRepository.findVehicleMultiplier(input.serviceId, vehicle.fuelType);
    const multiplierValue = vehicleMultiplier?.multiplier ?? 1;

    let addonsTotalPaise = 0;
    const addonSnapshots: BookingSnapshots['addons'] = [];
    if (input.addonIds?.length) {
      const activeAddons = await this.catalogRepository.findAddonsByServiceId(input.serviceId);
      for (const addonId of input.addonIds) {
        const found = activeAddons.find((addon: ServiceAddon) => addon.id === addonId && addon.isActive);
        if (!found) continue;
        addonsTotalPaise += found.price;
        addonSnapshots.push({ addonId: found.id!, name: found.name, pricePaise: found.price });
      }
    }

    const subtotalPaise = Math.round(basePricePaise * multiplierValue) + addonsTotalPaise;
    const taxesPaise = Math.round(subtotalPaise * 0.18);
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

    const booking = new Booking({
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      addressId: input.addressId,
      serviceId: input.serviceId,
      status: 'CREATED',
      slotStartTime: new Date(input.slotStartTime),
      slotEndTime: new Date(input.slotEndTime),
      expiryAt: new Date(now.getTime() + 15 * 60 * 1000),
      totalPricePaise,
      snapshots,
    });

    return this.transactionProvider.runInTransaction(() => this.bookingRepository.create(booking));
  }
}

export class ConfirmBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}
  async execute(bookingPublicId: string, customerId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking || booking.customerId !== customerId) throw new Error('Booking not found or unauthorized');
    booking.confirm(customerId);
    return this.bookingRepository.update(booking);
  }
}

export class AssignPartnerToBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(bookingPublicId: string, partnerId: number, adminUserId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) throw new Error('Booking not found');
    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner || partner.status !== 'ACTIVE') throw new Error('Partner not found or not active');
    const conflicting = await this.bookingRepository.findConflictingPartnerBooking(
      partnerId,
      booking.slotStartTime,
      booking.slotEndTime,
      booking.id,
    );
    if (conflicting) throw new Error('Partner has a conflicting booking assignment during this time slot');
    booking.assignPartner(partnerId, adminUserId);
    return this.bookingRepository.update(booking);
  }
}

export interface TransitionBookingStatusInput {
  bookingPublicId: string;
  targetStatus: BookingStatus;
  actorId: number;
}

export class TransitionBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly createPayoutEligibilityUseCase?: IPayoutEligibilityPort,
  ) {}

  async execute(input: TransitionBookingStatusInput): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) throw new Error('Booking not found');
    if (input.targetStatus === 'IN_PROGRESS') booking.startService(input.actorId);
    else if (input.targetStatus === 'COMPLETED') booking.completeService(input.actorId);
    else throw new Error(`Unsupported direct transition to ${input.targetStatus}`);

    const updated = await this.bookingRepository.update(booking);
    if (input.targetStatus === 'COMPLETED' && this.createPayoutEligibilityUseCase) {
      await this.createPayoutEligibilityUseCase.execute(booking.id!);
    }
    return updated;
  }
}

export interface CancelBookingInput {
  bookingPublicId: string;
  actorId: number;
  reason: string;
  isAdmin?: boolean;
}

export class CancelBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}
  async execute(input: CancelBookingInput): Promise<Booking> {
    if (!input.reason?.trim()) throw new Error('Cancellation reason is required');
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking) throw new Error('Booking not found');
    if (!input.isAdmin && booking.customerId !== input.actorId) throw new Error('Unauthorized to cancel this booking');
    booking.cancel(input.actorId, input.reason);
    return this.bookingRepository.update(booking);
  }
}

export class ExpirePendingBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}
  async execute(): Promise<number> {
    const expired = await this.bookingRepository.findExpiredPendingBookings(new Date());
    for (const booking of expired) {
      booking.expire('SYSTEM');
      await this.bookingRepository.update(booking);
    }
    return expired.length;
  }
}
