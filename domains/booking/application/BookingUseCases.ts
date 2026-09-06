import {
  DomainError,
  type ExecutionContext,
  type TransactionContext,
  systemClock,
} from "@carbroz/foundation-kernel";
import { Booking } from "../domain/Booking.js";
import type { BookingSnapshots } from "../domain/BookingSnapshots.js";
import type { BookingStatus } from "../domain/BookingStatus.js";
import type { IBookingRepository } from "../domain/repositories/IBookingRepository.js";
import type { BookingAccessPolicy } from "./security/BookingAccessPolicy.js";
import type {
  IAddressRepository,
  ICustomerProfileRepository,
  IVehicleRepository,
} from "@carbroz/domain-customer";
import type {
  ICatalogRepository,
  IPricingRepository,
  ServiceAddon,
} from "@carbroz/domain-catalog-pricing";

/** Booking-owned view of the universal transaction contract. */
export interface IBookingTransactionPort {
  runInTransaction<T>(
    work: (transaction: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export interface IPayoutEligibilityPort {
  execute(bookingId: number): Promise<unknown>;
}

export interface CreateBookingInput {
  /** Compatibility assertion only; authenticated authority comes from ExecutionContext.actor. */
  customerId?: number;
  vehicleId: number;
  addressId: number;
  serviceId: number;
  addonIds?: number[];
  slotStartTime: Date;
  slotEndTime: Date;
}

async function resolveCustomerId(
  context: ExecutionContext,
  customerRepository: ICustomerProfileRepository,
): Promise<number> {
  if (context.actor.kind !== "CUSTOMER")
    throw new DomainError(
      "Customer authority is required",
      "BOOKING_FORBIDDEN",
    );
  if (context.actor.customerId) return context.actor.customerId;
  const profile = await customerRepository.findByUserId(context.actor.id);
  if (!profile?.id)
    throw new DomainError(
      "Customer profile not found",
      "BOOKING_CUSTOMER_NOT_FOUND",
    );
  return profile.id;
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

  async execute(
    input: CreateBookingInput,
    context: ExecutionContext,
  ): Promise<Booking> {
    const customerId = await resolveCustomerId(
      context,
      this.customerRepository,
    );
    if (input.customerId !== undefined && input.customerId !== customerId) {
      throw new DomainError(
        "Booking customer does not match authenticated customer",
        "BOOKING_FORBIDDEN",
      );
    }

    const now = systemClock.now();
    const slotStartTime = new Date(input.slotStartTime);
    const slotEndTime = new Date(input.slotEndTime);
    if (slotStartTime <= now)
      throw new DomainError(
        "Slot start time must be in the future",
        "BOOKING_INVALID_SLOT",
      );
    if (slotEndTime <= slotStartTime)
      throw new DomainError(
        "Slot end time must be after slot start time",
        "BOOKING_INVALID_SLOT",
      );

    const vehicle = await this.vehicleRepository.findById(input.vehicleId);
    if (
      !vehicle ||
      vehicle.customerId !== customerId ||
      !vehicle.isBookable()
    ) {
      throw new DomainError(
        "Invalid or non-bookable vehicle",
        "BOOKING_INVALID_VEHICLE",
      );
    }

    const address = await this.addressRepository.findById(input.addressId);
    if (!address || address.userId !== context.actor.id)
      throw new DomainError("Address not found", "BOOKING_ADDRESS_NOT_FOUND");

    const service = await this.catalogRepository.findServiceById(
      input.serviceId,
    );
    if (!service || !service.isActive)
      throw new DomainError(
        "Service not found or inactive",
        "BOOKING_SERVICE_UNAVAILABLE",
      );

    let basePricePaise = service.basePrice;
    const defaultTier = await this.pricingRepository.findDefaultTierByServiceId(
      input.serviceId,
    );
    if (defaultTier) basePricePaise = defaultTier.flatPrice;

    const vehicleMultiplier =
      await this.pricingRepository.findVehicleMultiplier(
        input.serviceId,
        vehicle.fuelType,
      );
    const multiplierValue = vehicleMultiplier?.multiplier ?? 1;

    let addonsTotalPaise = 0;
    const addonSnapshots: BookingSnapshots["addons"] = [];
    if (input.addonIds?.length) {
      const activeAddons = await this.catalogRepository.findAddonsByServiceId(
        input.serviceId,
      );
      for (const addonId of input.addonIds) {
        const found = activeAddons.find(
          (addon: ServiceAddon) => addon.id === addonId && addon.isActive,
        );
        if (!found) continue;
        addonsTotalPaise += found.price;
        addonSnapshots.push({
          addonId: found.id!,
          name: found.name,
          pricePaise: found.price,
        });
      }
    }

    const subtotalPaise =
      Math.round(basePricePaise * multiplierValue) + addonsTotalPaise;
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
      customerId,
      vehicleId: input.vehicleId,
      addressId: input.addressId,
      serviceId: input.serviceId,
      status: "CREATED",
      slotStartTime,
      slotEndTime,
      expiryAt: new Date(now.getTime() + 15 * 60 * 1000),
      totalPricePaise,
      snapshots,
    });

    return this.transactionProvider.runInTransaction(async (transaction) => {
      const conflicting =
        await this.bookingRepository.findConflictingSlotBooking(
          input.serviceId,
          slotStartTime,
          slotEndTime,
          transaction,
        );
      if (conflicting)
        throw new DomainError(
          "Selected service slot is no longer available",
          "BOOKING_SLOT_CONFLICT",
        );
      return this.bookingRepository.create(booking, transaction);
    });
  }
}

export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
  ) {}

  async execute(
    bookingPublicId: string,
    context: ExecutionContext,
  ): Promise<Booking> {
    const customerId = await resolveCustomerId(
      context,
      this.customerRepository,
    );
    const booking =
      await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking || booking.customerId !== customerId)
      throw new DomainError(
        "Booking not found or unauthorized",
        "BOOKING_NOT_FOUND",
      );
    booking.confirm(context.actor.id);
    return this.bookingRepository.update(booking);
  }
}

export interface TransitionBookingStatusInput {
  bookingPublicId: string;
  targetStatus: BookingStatus;
}

export class TransitionBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingAccessPolicy: BookingAccessPolicy,
    private readonly createPayoutEligibilityUseCase?: IPayoutEligibilityPort,
  ) {}

  async execute(
    input: TransitionBookingStatusInput,
    context: ExecutionContext,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(
      input.bookingPublicId,
    );
    if (!booking)
      throw new DomainError("Booking not found", "BOOKING_NOT_FOUND");
    if (context.actor.kind !== "ADMIN") {
      if (context.actor.kind !== "PARTNER") {
        throw new DomainError(
          "Assigned partner authority is required",
          "BOOKING_FORBIDDEN",
        );
      }
      await this.bookingAccessPolicy.assertPartnerAccess(
        booking,
        context.actor.id,
      );
    }
    if (input.targetStatus === "IN_PROGRESS")
      booking.startService(context.actor.id);
    else if (input.targetStatus === "COMPLETED")
      booking.completeService(context.actor.id);
    else
      throw new DomainError(
        "Unsupported direct transition to " + input.targetStatus,
        "BOOKING_INVALID_TRANSITION",
      );

    const updated = await this.bookingRepository.update(booking);
    if (
      input.targetStatus === "COMPLETED" &&
      this.createPayoutEligibilityUseCase
    ) {
      await this.createPayoutEligibilityUseCase.execute(booking.id!);
    }
    return updated;
  }
}

export interface CancelBookingInput {
  bookingPublicId: string;
  reason: string;
}

export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly customerRepository: ICustomerProfileRepository,
  ) {}

  async execute(
    input: CancelBookingInput,
    context: ExecutionContext,
  ): Promise<Booking> {
    if (!input.reason?.trim())
      throw new DomainError(
        "Cancellation reason is required",
        "BOOKING_CANCELLATION_REASON_REQUIRED",
      );
    const booking = await this.bookingRepository.findByPublicId(
      input.bookingPublicId,
    );
    if (!booking)
      throw new DomainError("Booking not found", "BOOKING_NOT_FOUND");

    if (context.actor.kind !== "ADMIN") {
      const customerId = await resolveCustomerId(
        context,
        this.customerRepository,
      );
      if (booking.customerId !== customerId)
        throw new DomainError(
          "Unauthorized to cancel this booking",
          "BOOKING_FORBIDDEN",
        );
    }
    booking.cancel(context.actor.id, input.reason);
    return this.bookingRepository.update(booking);
  }
}

export class ExpirePendingBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly transactionProvider: IBookingTransactionPort,
  ) {}

  async execute(context: ExecutionContext): Promise<number> {
    if (context.actor.kind !== "SYSTEM" && context.actor.kind !== "ADMIN") {
      throw new DomainError(
        "System authority is required to expire bookings",
        "BOOKING_FORBIDDEN",
      );
    }
    const now = systemClock.now();
    return this.transactionProvider.runInTransaction(async (transaction) => {
      const expired = await this.bookingRepository.findExpiredPendingBookings(
        now,
        transaction,
      );
      for (const booking of expired) {
        booking.expire("SYSTEM");
        await this.bookingRepository.update(booking, transaction);
      }
      return expired.length;
    });
  }
}
