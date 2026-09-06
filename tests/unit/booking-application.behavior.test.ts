import { describe, expect, it, vi } from "vitest";
import type {
  ExecutionContext,
  TransactionContext,
} from "@carbroz/foundation-kernel";
import {
  CancelBookingUseCase,
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  ExpirePendingBookingsUseCase,
  TransitionBookingStatusUseCase,
} from "@carbroz/domain-booking";

const future = (minutes: number) => new Date(Date.now() + minutes * 60_000);
const customerContext: ExecutionContext = {
  correlationId: "customer-test",
  timestamp: new Date("2026-09-06T12:00:00Z"),
  actor: { id: 70, kind: "CUSTOMER", roles: ["CUSTOMER"], customerId: 7 },
};
const foreignContext: ExecutionContext = {
  ...customerContext,
  actor: { ...customerContext.actor, id: 80, customerId: 8 },
};
const partnerContext: ExecutionContext = {
  correlationId: "partner-test",
  timestamp: new Date("2026-09-06T12:00:00Z"),
  actor: { id: 220, kind: "PARTNER", roles: ["PARTNER"], partnerId: 22 },
};
const adminContext: ExecutionContext = {
  correlationId: "admin-test",
  timestamp: new Date("2026-09-06T12:00:00Z"),
  actor: { id: 1, kind: "ADMIN", roles: ["ADMIN"] },
};
const systemContext: ExecutionContext = {
  correlationId: "system-test",
  timestamp: new Date("2026-09-06T12:00:00Z"),
  actor: { id: 1, kind: "SYSTEM", roles: ["SYSTEM"] },
};
const transaction: TransactionContext = { resource: {} };

function input(overrides: Record<string, unknown> = {}) {
  return {
    customerId: 7,
    vehicleId: 2,
    addressId: 3,
    serviceId: 4,
    addonIds: [11, 12, 999],
    slotStartTime: future(60),
    slotEndTime: future(120),
    ...overrides,
  } as any;
}
function vehicle(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    customerId: 7,
    make: "Tata",
    model: "Nexon",
    variant: "XZ",
    year: 2025,
    registrationNumber: "MH01AB1234",
    fuelType: "PETROL",
    isBookable: vi.fn().mockReturnValue(true),
    ...overrides,
  };
}
function address() {
  return {
    id: 3,
    userId: 70,
    addressLine1: "A-1",
    addressLine2: "Floor 2",
    city: "Pune",
    state: "MH",
    postalCode: "411001",
    country: "IN",
    latitude: 18.52,
    longitude: 73.85,
  };
}
function service(overrides: Record<string, unknown> = {}) {
  return {
    id: 4,
    name: "Deep Wash",
    basePrice: 1_000,
    estimatedDurationMinutes: 90,
    isActive: true,
    ...overrides,
  };
}
function bookingRepo(overrides: Record<string, unknown> = {}) {
  return {
    findConflictingSlotBooking: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (value) => value),
    findByPublicId: vi.fn().mockResolvedValue(null),
    update: vi.fn(async (value) => value),
    findExpiredPendingBookings: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}
function txProvider() {
  return { runInTransaction: vi.fn(async (work) => work(transaction)) };
}
function customerRepo() {
  return { findByUserId: vi.fn().mockResolvedValue({ id: 7 }) };
}
function partnerAccessPolicy() {
  return {
    assertPartnerAccess: vi.fn(async (booking: any, userId: number) => {
      if (booking.partnerId !== 22 || userId !== 220) {
        throw new Error("Assigned partner authority is required");
      }
    }),
  };
}
function createDeps(overrides: Record<string, unknown> = {}) {
  return {
    bookingRepository: bookingRepo(),
    vehicleRepository: { findById: vi.fn().mockResolvedValue(vehicle()) },
    addressRepository: { findById: vi.fn().mockResolvedValue(address()) },
    catalogRepository: {
      findServiceById: vi.fn().mockResolvedValue(service()),
      findAddonsByServiceId: vi.fn().mockResolvedValue([
        { id: 11, name: "Interior", price: 200, isActive: true },
        { id: 12, name: "Inactive", price: 300, isActive: false },
      ]),
    },
    pricingRepository: {
      findDefaultTierByServiceId: vi
        .fn()
        .mockResolvedValue({ flatPrice: 1_200 }),
      findVehicleMultiplier: vi.fn().mockResolvedValue({ multiplier: 1.5 }),
    },
    customerRepository: customerRepo(),
    transactionProvider: txProvider(),
    ...overrides,
  } as any;
}
function createUseCase(d: any) {
  return new CreateBookingUseCase(
    d.bookingRepository,
    d.vehicleRepository,
    d.addressRepository,
    d.catalogRepository,
    d.pricingRepository,
    d.customerRepository,
    d.transactionProvider,
  );
}

describe("Booking application CW4 behavior", () => {
  it("derives customer authority from ExecutionContext and rejects DTO mismatch", async () => {
    const deps = createDeps();
    await expect(
      createUseCase(deps).execute(input({ customerId: 8 }), customerContext),
    ).rejects.toThrow("does not match authenticated customer");
    await expect(
      createUseCase(deps).execute(input(), {
        ...customerContext,
        actor: { id: 1, kind: "ADMIN", roles: ["ADMIN"] },
      }),
    ).rejects.toThrow("Customer authority is required");
  });

  it("rejects invalid slot, vehicle, address and service inputs with typed failures", async () => {
    const deps = createDeps();
    await expect(
      createUseCase(deps).execute(
        input({
          slotStartTime: new Date("2000-01-01"),
          slotEndTime: future(60),
        }),
        customerContext,
      ),
    ).rejects.toThrow("Slot start time must be in the future");
    const badVehicle = createDeps({
      vehicleRepository: {
        findById: vi.fn().mockResolvedValue(vehicle({ customerId: 8 })),
      },
    });
    await expect(
      createUseCase(badVehicle).execute(input(), customerContext),
    ).rejects.toThrow("Invalid or non-bookable vehicle");
    const noAddress = createDeps({
      addressRepository: { findById: vi.fn().mockResolvedValue(null) },
    });
    await expect(
      createUseCase(noAddress).execute(input(), customerContext),
    ).rejects.toThrow("Address not found");
    const noService = createDeps({
      catalogRepository: {
        findServiceById: vi.fn().mockResolvedValue(null),
        findAddonsByServiceId: vi.fn(),
      },
    });
    await expect(
      createUseCase(noService).execute(input(), customerContext),
    ).rejects.toThrow("Service not found or inactive");
  });

  it("checks slot conflict and create through the exact same transaction context", async () => {
    const deps = createDeps();
    const result: any = await createUseCase(deps).execute(
      input(),
      customerContext,
    );
    expect(deps.transactionProvider.runInTransaction).toHaveBeenCalledOnce();
    expect(
      deps.bookingRepository.findConflictingSlotBooking,
    ).toHaveBeenCalledWith(4, expect.any(Date), expect.any(Date), transaction);
    expect(deps.bookingRepository.create).toHaveBeenCalledWith(
      result,
      transaction,
    );
    expect(result.totalPricePaise).toBe(2_360);
  });

  it("rejects a slot conflict inside the transaction before create", async () => {
    const deps = createDeps({
      bookingRepository: bookingRepo({
        findConflictingSlotBooking: vi.fn().mockResolvedValue({ id: 99 }),
      }),
    });
    await expect(
      createUseCase(deps).execute(input(), customerContext),
    ).rejects.toThrow("Selected service slot is no longer available");
    expect(deps.bookingRepository.create).not.toHaveBeenCalled();
  });

  it("confirms only the authenticated owning customer", async () => {
    const owned = { customerId: 7, confirm: vi.fn() };
    const repo = bookingRepo({
      findByPublicId: vi.fn().mockResolvedValue(owned),
    });
    const uc = new ConfirmBookingUseCase(repo as any, customerRepo() as any);
    await expect(uc.execute("owned", customerContext)).resolves.toBe(owned);
    expect(owned.confirm).toHaveBeenCalledWith(70);
    await expect(uc.execute("owned", foreignContext)).rejects.toThrow(
      "Booking not found or unauthorized",
    );
  });

  it("requires assigned partner/admin authority for service state transitions", async () => {
    const b = {
      partnerId: 22,
      startService: vi.fn(),
      completeService: vi.fn(),
      id: 10,
    };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    const accessPolicy = partnerAccessPolicy();
    await new TransitionBookingStatusUseCase(repo as any, accessPolicy as any).execute(
      { bookingPublicId: "x", targetStatus: "IN_PROGRESS" },
      partnerContext,
    );
    expect(b.startService).toHaveBeenCalledWith(220);
    expect(accessPolicy.assertPartnerAccess).toHaveBeenCalledWith(b, 220);
    await expect(
      new TransitionBookingStatusUseCase(repo as any, accessPolicy as any).execute(
        { bookingPublicId: "x", targetStatus: "COMPLETED" },
        {
          ...partnerContext,
          actor: { ...partnerContext.actor, id: 221 },
        },
      ),
    ).rejects.toThrow("Assigned partner authority is required");
    await expect(
      new TransitionBookingStatusUseCase(repo as any, accessPolicy as any).execute(
        { bookingPublicId: "x", targetStatus: "CANCELLED" as any },
        adminContext,
      ),
    ).rejects.toThrow("Unsupported direct transition");
  });

  it("creates payout eligibility only after completion when configured", async () => {
    const b = { partnerId: 22, completeService: vi.fn(), id: 10 };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    const payout = { execute: vi.fn().mockResolvedValue({}) };
    const accessPolicy = partnerAccessPolicy();
    await new TransitionBookingStatusUseCase(
      repo as any,
      accessPolicy as any,
      payout,
    ).execute(
      { bookingPublicId: "x", targetStatus: "COMPLETED" },
      partnerContext,
    );
    expect(payout.execute).toHaveBeenCalledWith(10);
  });

  it("allows cancellation only to owning customer or admin", async () => {
    const b = { customerId: 7, cancel: vi.fn() };
    const repo = bookingRepo({ findByPublicId: vi.fn().mockResolvedValue(b) });
    const uc = new CancelBookingUseCase(repo as any, customerRepo() as any);
    await uc.execute(
      { bookingPublicId: "x", reason: "changed plan" },
      customerContext,
    );
    expect(b.cancel).toHaveBeenCalledWith(70, "changed plan");
    await uc.execute({ bookingPublicId: "x", reason: "fraud" }, adminContext);
    expect(b.cancel).toHaveBeenCalledWith(1, "fraud");
    await expect(
      uc.execute({ bookingPublicId: "x", reason: "x" }, foreignContext),
    ).rejects.toThrow("Unauthorized to cancel this booking");
  });

  it("expires the full batch inside one transaction and rejects non-system authority", async () => {
    const first = { expire: vi.fn() };
    const second = { expire: vi.fn() };
    const repo = bookingRepo({
      findExpiredPendingBookings: vi.fn().mockResolvedValue([first, second]),
    });
    const tx = txProvider();
    const uc = new ExpirePendingBookingsUseCase(repo as any, tx as any);
    await expect(uc.execute(systemContext)).resolves.toBe(2);
    expect(repo.findExpiredPendingBookings).toHaveBeenCalledWith(
      expect.any(Date),
      transaction,
    );
    expect(repo.update).toHaveBeenCalledWith(first, transaction);
    expect(repo.update).toHaveBeenCalledWith(second, transaction);
    await expect(uc.execute(customerContext)).rejects.toThrow(
      "System authority is required",
    );
  });
});
