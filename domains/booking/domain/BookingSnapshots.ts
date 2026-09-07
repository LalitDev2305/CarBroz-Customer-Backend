import { rateToBasisPoints } from "@carbroz/foundation-kernel";

export const LEGACY_PRICE_SNAPSHOT_VERSION = 1;
export const CURRENT_PRICE_SNAPSHOT_VERSION = 2;
export const BOOKING_QUOTE_CURRENCY = "INR" as const;

/** ServiceSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ServiceSnapshot {
  readonly serviceId: number;
  readonly name: string;
  readonly categoryName?: string;
  readonly basePricePaise: number;
  readonly estimatedDurationMinutes: number;
}

/** AddonSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddonSnapshot {
  readonly addonId: number;
  readonly name: string;
  readonly pricePaise: number;
}

/**
 * Immutable quotation snapshot. Version 1 is the historical shape that did not
 * persist explicit schema/currency/rate units; version 2 is the canonical shape
 * for all new bookings.
 */
export interface PriceSnapshot {
  readonly schemaVersion: number;
  readonly currency: string;
  readonly basePricePaise: number;
  readonly addonsTotalPaise: number;
  /** Display/backward-compatibility rate only; monetary calculations use basis points. */
  readonly vehicleMultiplier: number;
  readonly vehicleMultiplierBasisPoints: number;
  readonly subtotalPaise: number;
  readonly taxesPaise: number;
  readonly totalPricePaise: number;
}

/** AddressSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface AddressSnapshot {
  readonly addressLine1: string;
  readonly addressLine2?: string | null;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

/** VehicleSnapshot is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface VehicleSnapshot {
  readonly make: string;
  readonly model: string;
  readonly variant?: string | null;
  readonly year: number;
  readonly registrationNumber: string;
  readonly fuelType: string;
}

/** BookingSnapshots is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface BookingSnapshots {
  readonly service: ServiceSnapshot;
  readonly addons: readonly AddonSnapshot[];
  readonly pricing: PriceSnapshot;
  readonly address: AddressSnapshot;
  readonly vehicle: VehicleSnapshot;
}

function assertSafePaise(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative safe integer in paise`);
  }
  return value;
}

/**
 * Normalizes historical JSON snapshots into the current domain contract without
 * rewriting persisted history. New writes must explicitly use version 2.
 */
export function normalizeBookingSnapshots(input: unknown): BookingSnapshots {
  if (!input || typeof input !== "object") throw new Error("Booking snapshots are required");
  const raw = input as Record<string, any>;
  const pricingRaw = raw.pricing as Record<string, any> | undefined;
  if (!pricingRaw) throw new Error("Booking pricing snapshot is required");

  const vehicleMultiplier =
    typeof pricingRaw.vehicleMultiplier === "number" && Number.isFinite(pricingRaw.vehicleMultiplier)
      ? pricingRaw.vehicleMultiplier
      : 1;
  const vehicleMultiplierBasisPoints =
    typeof pricingRaw.vehicleMultiplierBasisPoints === "number" &&
    Number.isSafeInteger(pricingRaw.vehicleMultiplierBasisPoints)
      ? pricingRaw.vehicleMultiplierBasisPoints
      : rateToBasisPoints(vehicleMultiplier);

  const pricing: PriceSnapshot = Object.freeze({
    schemaVersion:
      typeof pricingRaw.schemaVersion === "number" && Number.isSafeInteger(pricingRaw.schemaVersion)
        ? pricingRaw.schemaVersion
        : LEGACY_PRICE_SNAPSHOT_VERSION,
    currency:
      typeof pricingRaw.currency === "string" && pricingRaw.currency.trim()
        ? pricingRaw.currency.trim().toUpperCase()
        : BOOKING_QUOTE_CURRENCY,
    basePricePaise: assertSafePaise(pricingRaw.basePricePaise, "pricing.basePricePaise"),
    addonsTotalPaise: assertSafePaise(pricingRaw.addonsTotalPaise, "pricing.addonsTotalPaise"),
    vehicleMultiplier,
    vehicleMultiplierBasisPoints,
    subtotalPaise: assertSafePaise(pricingRaw.subtotalPaise, "pricing.subtotalPaise"),
    taxesPaise: assertSafePaise(pricingRaw.taxesPaise, "pricing.taxesPaise"),
    totalPricePaise: assertSafePaise(pricingRaw.totalPricePaise, "pricing.totalPricePaise"),
  });

  const addons = Object.freeze(
    (Array.isArray(raw.addons) ? raw.addons : []).map((addon: Record<string, any>) =>
      Object.freeze({ ...addon }),
    ),
  );

  return Object.freeze({
    service: Object.freeze({ ...(raw.service as Record<string, unknown>) }) as ServiceSnapshot,
    addons: addons as readonly AddonSnapshot[],
    pricing,
    address: Object.freeze({ ...(raw.address as Record<string, unknown>) }) as AddressSnapshot,
    vehicle: Object.freeze({ ...(raw.vehicle as Record<string, unknown>) }) as VehicleSnapshot,
  });
}
