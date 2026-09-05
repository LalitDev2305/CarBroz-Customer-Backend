import { describe, expect, it } from 'vitest';
import {
  AuditLogService,
  Dispute,
  NotificationService,
} from '@carbroz/common';
import type {
  IBookingRepository,
  IDisputeRepository,
  IPaymentRepository,
} from '@carbroz/common';
import { RaiseDisputeUseCase } from '../src/modules/dispute/use-cases/RaiseDisputeUseCase.js';
import { ResolveDisputeUseCase } from '../src/modules/dispute/use-cases/ResolveDisputeUseCase.js';

describe('Phase 21 — Dispute Settlement Engine Use Cases', () => {
  const disputes: Dispute[] = [];

  const mockDisputeRepo: IDisputeRepository = {
    async create(dispute) {
      dispute.id = disputes.length + 1;
      dispute.publicId = '90000000-0000-0000-0000-000000000999';
      disputes.push(dispute);
      return dispute;
    },
    async update(dispute) {
      const idx = disputes.findIndex((d) => d.id === dispute.id);
      if (idx !== -1) disputes[idx] = dispute;
      return dispute;
    },
    async findById(id) {
      return disputes.find((d) => d.id === id) ?? null;
    },
    async findByPublicId(publicId) {
      return disputes.find((d) => d.publicId === publicId) ?? null;
    },
    async findActiveByBookingId(bookingId) {
      return disputes.find((d) => d.bookingId === bookingId && ['OPEN', 'UNDER_REVIEW'].includes(d.status)) ?? null;
    },
    async listByBookingId(bookingId) {
      return disputes.filter((d) => d.bookingId === bookingId);
    },
    async list() {
      return disputes;
    },
  };

  const mockBookingRepo: IBookingRepository = {
    async findByPublicId(publicId) {
      if (publicId === 'booking_101') {
        return { id: 101, publicId: 'booking_101', customerId: 10, partnerId: 20, status: 'COMPLETED' } as any;
      }
      return null;
    },
    async findById(id) {
      if (id === 101) {
        return { id: 101, publicId: 'booking_101', customerId: 10, partnerId: 20, status: 'COMPLETED' } as any;
      }
      return null;
    },
    async create() { throw new Error('Not implemented'); },
    async update() { throw new Error('Not implemented'); },
    async listByCustomerId() { return []; },
    async listByPartnerId() { return []; },
    async listAll() { return []; },
    async findConflictingPartnerBooking() { return null; },
    async findConflictingSlotBooking() { return null; },
    async findExpiredPendingBookings() { return []; },
  };

  const mockPaymentRepo: IPaymentRepository = {
    async findByBookingId() {
      return { id: 1, externalTransactionId: 'pay_rzp_123', status: 'SUCCESS' } as any;
    },
    async create() { throw new Error('Not implemented'); },
    async update() { throw new Error('Not implemented'); },
    async findById() { return null; },
    async findByPublicId() { return null; },
    async findByProviderOrderId() { return null; },
    async findByProviderPaymentId() { return null; },
    async findByIdempotencyKey() { return null; },
    async saveWebhook() { throw new Error('Not implemented'); },
    async findWebhookByEventId() { return null; },
    async updateWebhook() { throw new Error('Not implemented'); },
  };

  const notificationsSent: any[] = [];
  const mockNotificationService: NotificationService = {
    async send(payload: any) {
      notificationsSent.push(payload);
      return {} as any;
    },
  } as any;

  const auditLogs: any[] = [];
  const mockAuditLogService: AuditLogService = {
    async log(props: any) {
      auditLogs.push(props);
      return props as any;
    },
  } as any;

  it('should raise dispute successfully for booking customer', async () => {
    const useCase = new RaiseDisputeUseCase(
      mockDisputeRepo,
      mockBookingRepo,
      mockNotificationService,
      mockAuditLogService
    );

    const dispute = await useCase.execute({
      bookingPublicId: 'booking_101',
      actorId: 10,
      actorType: 'CUSTOMER',
      disputeReason: 'SERVICE_QUALITY_DEFECT',
      description: 'Car was not cleaned properly',
      requestedRefundPaise: 25000,
    });

    expect(dispute.publicId).toBeDefined();
    expect(dispute.status).toBe('OPEN');
    expect(dispute.requestedRefundAmount.amountMinor).toBe(25000);
    expect(notificationsSent.length).toBe(1);
    expect(auditLogs.length).toBe(1);
  });

  it('should prevent unauthorized non-owner from raising dispute', async () => {
    const useCase = new RaiseDisputeUseCase(
      mockDisputeRepo,
      mockBookingRepo,
      mockNotificationService,
      mockAuditLogService
    );

    await expect(
      useCase.execute({
        bookingPublicId: 'booking_101',
        actorId: 99,
        actorType: 'CUSTOMER',
        disputeReason: 'WRONG_BILLING',
        requestedRefundPaise: 10000,
      })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should resolve dispute as REFUNDED', async () => {
    const useCase = new ResolveDisputeUseCase(
      mockDisputeRepo,
      mockBookingRepo,
      mockPaymentRepo,
      mockNotificationService,
      mockAuditLogService
    );

    const resolved = await useCase.execute({
      disputePublicId: '90000000-0000-0000-0000-000000000999',
      adminId: 1,
      action: 'REFUND',
      approvedRefundPaise: 25000,
      resolutionNotes: 'Approved 50% partial refund for quality defect',
    });

    expect(resolved.status).toBe('RESOLVED_REFUNDED');
    expect(resolved.refundedAmount.amountMinor).toBe(25000);
  });
});
