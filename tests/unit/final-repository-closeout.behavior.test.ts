import { describe, expect, it, vi } from 'vitest';
import { Money } from '@carbroz/foundation-kernel';
import { PrismaConfigRepository } from '../../domains/configuration/infrastructure/repositories/PrismaConfigRepository.js';
import { PrismaFeatureFlagRepository } from '../../domains/configuration/infrastructure/repositories/PrismaFeatureFlagRepository.js';
import { NotificationLog } from '../../domains/communications/domain/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../../domains/communications/infrastructure/repositories/PrismaNotificationLogRepository.js';
import { Coupon } from '../../domains/engagement/coupon/domain/Coupon.js';
import { PrismaCouponRepository } from '../../domains/engagement/coupon/infrastructure/repositories/PrismaCouponRepository.js';
import { Dispute } from '../../domains/dispute/domain/Dispute.js';
import { PrismaDisputeRepository } from '../../domains/dispute/infrastructure/repositories/PrismaDisputeRepository.js';
import { ResolveDisputeUseCase } from '../../domains/dispute/application/use-cases/ResolveDisputeUseCase.js';
import { TrackingSession } from '../../domains/operations/tracking/domain/TrackingSession.js';
import { LocationPing } from '../../domains/operations/tracking/domain/LocationPing.js';
import { PrismaTrackingSessionRepository } from '../../domains/operations/tracking/infrastructure/repositories/PrismaTrackingSessionRepository.js';

const now = new Date('2026-01-01T00:00:00.000Z');

describe('final cross-domain repository closeout', () => {
  it('covers configuration repository null/list/upsert/delete/key and UoW branches', async () => {
    const model = { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), upsert: vi.fn(), update: vi.fn() };
    const repo = new PrismaConfigRepository({ systemConfig: model } as any);
    const record = { id: 1, publicId: 'cfg-1', key: 'x', value: { a: 1 }, description: null, createdAt: now, updatedAt: now, deletedAt: null };
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findById(1)).resolves.toMatchObject({ key: 'x' });
    model.findMany.mockResolvedValue([record]);
    await expect(repo.findAll()).resolves.toHaveLength(1);
    await expect(repo.findAllConfig()).resolves.toHaveLength(1);
    model.upsert.mockResolvedValue(record);
    await repo.save({ ...record, id: 0 } as any);
    expect(model.upsert).toHaveBeenLastCalledWith(expect.objectContaining({ where: { id: 0 } }));
    await repo.save(record as any);
    model.update.mockResolvedValue(record);
    await expect(repo.delete(1)).resolves.toBe(true);
    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findByKey('missing')).resolves.toBeNull();
    await expect(repo.findByKey('x')).resolves.toMatchObject({ id: 1 });
  });

  it('covers feature flag lookup/list/create/update/publicId/delete branches', async () => {
    const model = { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() };
    const repo = new PrismaFeatureFlagRepository({ featureFlag: model } as any);
    const record = { id: 1, publicId: 'flag-1', key: 'new_ui', enabled: true, description: null, createdAt: now, updatedAt: now, deletedAt: null };
    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record).mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findById(1)).resolves.toMatchObject({ key: 'new_ui' });
    await expect(repo.findByKey('missing')).resolves.toBeNull();
    await expect(repo.findByKey('new_ui')).resolves.toMatchObject({ id: 1 });
    model.findMany.mockResolvedValue([record]);
    await expect(repo.findAll()).resolves.toHaveLength(1);
    await expect(repo.findAllFlags()).resolves.toHaveLength(1);
    model.create.mockResolvedValue(record);
    await repo.save({ ...record, id: undefined, publicId: undefined } as any);
    await repo.save({ ...record, id: undefined, publicId: 'explicit' } as any);
    model.update.mockResolvedValue(record);
    await repo.save(record as any);
    model.update.mockResolvedValueOnce(record);
    await expect(repo.delete(1)).resolves.toBe(true);
    model.update.mockRejectedValueOnce(new Error('missing'));
    await expect(repo.delete(1)).resolves.toBe(false);
  });

  it('covers notification log domain validation/defaults and repository lookup/list/create paths', async () => {
    const props = { recipientId: 1, channel: 'PUSH' as any, provider: 'FCM', templateId: 'T', recipient: 'u1' };
    expect(() => new NotificationLog({ ...props, recipientId: 0 })).toThrow('recipientId');
    expect(() => new NotificationLog({ ...props, recipient: '' })).toThrow('recipient');
    expect(() => new NotificationLog({ ...props, templateId: '' })).toThrow('templateId');
    const log = new NotificationLog(props);
    expect(log).toMatchObject({ bookingId: null, status: 'SENT', providerReference: null, errorCode: null });
    const record = { ...log, id: 1, publicId: 'n-1', createdAt: now };
    const model = { create: vi.fn().mockResolvedValue(record), findUnique: vi.fn(), findMany: vi.fn() };
    const repo = new PrismaNotificationLogRepository({ notificationLog: model } as any);
    await expect(repo.create(log)).resolves.toMatchObject({ id: 1 });
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record).mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repo.findByPublicId('x')).resolves.toBeNull();
    await expect(repo.findByPublicId('n-1')).resolves.toMatchObject({ id: 1 });
    model.findMany.mockResolvedValue([record]);
    await expect(repo.listByRecipientId(1)).resolves.toHaveLength(1);
    await expect(repo.listByRecipientId(1, 10, 5)).resolves.toHaveLength(1);
    await expect(repo.listByBookingId(2)).resolves.toHaveLength(1);
  });

  it('covers coupon validation/default/validity and repository CRUD paths', async () => {
    const base = { code: ' save10 ', discountType: 'PERCENTAGE' as any, discountValue: 10, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31') };
    expect(() => new Coupon({ ...base, code: '' })).toThrow('code');
    expect(() => new Coupon({ ...base, discountValue: 0 })).toThrow('positive integer');
    expect(() => new Coupon({ ...base, discountValue: 10.5 })).toThrow('positive integer');
    expect(() => new Coupon({ ...base, discountValue: 101 })).toThrow('cannot exceed');
    expect(() => new Coupon({ ...base, validFrom: base.validUntil, validUntil: base.validFrom })).toThrow('earlier');
    const coupon = new Coupon(base);
    expect(coupon).toMatchObject({ code: 'SAVE10', description: null, minBookingAmountPaise: 0, usageLimit: null, perUserLimit: 1, currentUsageCount: 0, isActive: true });
    expect(coupon.isValidAt(new Date('2025-01-01'))).toBe(false);
    expect(coupon.isValidAt(new Date('2027-01-01'))).toBe(false);
    expect(coupon.isValidAt(new Date('2026-06-01'))).toBe(true);
    coupon.incrementUsage();
    coupon.deactivate();
    expect(coupon.isValidAt(new Date('2026-06-01'))).toBe(false);
    const limited = new Coupon({ ...base, usageLimit: 1, currentUsageCount: 1 });
    expect(limited.isValidAt(new Date('2026-06-01'))).toBe(false);

    const record = { ...coupon, id: 1, publicId: 'c-1', code: 'SAVE10', createdAt: now, updatedAt: now };
    const model = { create: vi.fn().mockResolvedValue(record), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn().mockResolvedValue(record) };
    const repo = new PrismaCouponRepository({ coupon: model } as any);
    await repo.create(coupon);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record).mockResolvedValueOnce(null).mockResolvedValueOnce(record).mockResolvedValueOnce(record);
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repo.findByPublicId('x')).resolves.toBeNull();
    await expect(repo.findByPublicId('c-1')).resolves.toMatchObject({ id: 1 });
    await expect(repo.findByCode(' save10 ')).resolves.toMatchObject({ code: 'SAVE10' });
    model.findMany.mockResolvedValue([record]);
    await expect(repo.listActive(now)).resolves.toHaveLength(1);
    await repo.update(coupon);
    await repo.incrementUsage(1);
  });

  it('covers dispute repository null/map/list filters and resolution branches', async () => {
    const dispute = new Dispute({ bookingId: 1, raisedByActorId: 2, raisedByActorType: 'CUSTOMER', disputeReason: 'QUALITY', requestedRefundAmount: Money.fromMinor(1000) });
    const record = { id: 1, publicId: 'd-1', bookingId: 1, raisedByActorId: 2, raisedByActorType: 'CUSTOMER', disputeReason: 'QUALITY', description: null, requestedRefundPaise: 1000, refundedAmountPaise: 0, status: 'OPEN', resolutionNotes: null, resolvedAt: null, createdAt: now, updatedAt: now };
    const model = { create: vi.fn().mockResolvedValue(record), update: vi.fn().mockResolvedValue(record), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() };
    const repo = new PrismaDisputeRepository({ dispute: model } as any);
    await repo.create(dispute);
    await repo.update(dispute);
    model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record).mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findById(1)).resolves.toBeNull();
    await expect(repo.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repo.findByPublicId('x')).resolves.toBeNull();
    await expect(repo.findByPublicId('d-1')).resolves.toMatchObject({ id: 1 });
    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findActiveByBookingId(1)).resolves.toBeNull();
    await expect(repo.findActiveByBookingId(1)).resolves.toMatchObject({ id: 1 });
    model.findMany.mockResolvedValue([record]);
    await expect(repo.listByBookingId(1)).resolves.toHaveLength(1);
    await expect(repo.list()).resolves.toHaveLength(1);
    await expect(repo.list('OPEN' as any, 10, 2)).resolves.toHaveLength(1);
  });

  it('covers ResolveDispute missing resource/booking/payment, refund default/explicit and reject paths', async () => {
    const disputeRepo = { findByPublicId: vi.fn(), update: vi.fn(async (d: unknown) => d) } as any;
    const bookingRepo = { findById: vi.fn() } as any;
    const paymentRepo = { findByBookingId: vi.fn() } as any;
    const notification = { send: vi.fn() } as any;
    const audit = { log: vi.fn() } as any;
    const useCase = new ResolveDisputeUseCase(disputeRepo, bookingRepo, paymentRepo, notification, audit);
    disputeRepo.findByPublicId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ disputePublicId: 'x', adminId: 1, action: 'REJECT', resolutionNotes: 'x' })).rejects.toThrow();
    const makeDispute = () => new Dispute({ id: 1, publicId: 'd-1', bookingId: 7, raisedByActorId: 2, raisedByActorType: 'CUSTOMER', disputeReason: 'QUALITY', requestedRefundAmount: Money.fromMinor(1000) });
    disputeRepo.findByPublicId.mockResolvedValue(makeDispute()); bookingRepo.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute({ disputePublicId: 'd-1', adminId: 1, action: 'REJECT', resolutionNotes: 'x' })).rejects.toThrow();
    bookingRepo.findById.mockResolvedValue({ id: 7, publicId: 'b-7' });
    disputeRepo.findByPublicId.mockResolvedValueOnce(makeDispute()); paymentRepo.findByBookingId.mockResolvedValueOnce(null);
    await expect(useCase.execute({ disputePublicId: 'd-1', adminId: 1, action: 'REFUND', resolutionNotes: 'x' })).rejects.toThrow();
    disputeRepo.findByPublicId.mockResolvedValueOnce(makeDispute()); paymentRepo.findByBookingId.mockResolvedValueOnce({ id: 1 });
    await expect(useCase.execute({ disputePublicId: 'd-1', adminId: 1, action: 'REFUND', approvedRefundPaise: 500, resolutionNotes: 'partial' })).resolves.toMatchObject({ status: 'RESOLVED_REFUNDED' });
    disputeRepo.findByPublicId.mockResolvedValueOnce(makeDispute());
    await expect(useCase.execute({ disputePublicId: 'd-1', adminId: 1, action: 'REJECT', resolutionNotes: 'reject' })).resolves.toMatchObject({ status: 'RESOLVED_REJECTED' });
    expect(audit.log).toHaveBeenCalledTimes(2);
    expect(notification.send).toHaveBeenCalledTimes(2);
  });

  it('covers tracking repository lookup variants and TrackingSession lifecycle branches', async () => {
    const session = new TrackingSession({ bookingId: 1, partnerId: 2, customerId: 3, currentLatitude: 18.5, currentLongitude: 73.8 });
    const record = { ...session, id: 1, publicId: 't-1', createdAt: now, updatedAt: now };
    const model = { create: vi.fn().mockResolvedValue(record), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn().mockResolvedValue(record) };
    const repo = new PrismaTrackingSessionRepository({ trackingSession: model } as any);
    await repo.create(session);
    for (const call of [() => repo.findById(1), () => repo.findByPublicId('t-1'), () => repo.findByBookingId(1)]) {
      model.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
      await expect(call()).resolves.toBeNull();
      await expect(call()).resolves.toMatchObject({ id: 1 });
    }
    model.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    await expect(repo.findActiveByPartnerId(2)).resolves.toBeNull();
    await expect(repo.findActiveByPartnerId(2)).resolves.toMatchObject({ id: 1 });
    await repo.update(session);

    session.updateLocation(new LocationPing({ latitude: 19, longitude: 74, heading: 10, speed: 20 }), 5);
    expect(session.etaMinutes).toBe(5);
    session.updateLocation(new LocationPing({ latitude: 20, longitude: 75 }));
    expect(session.currentLocationPing.latitude).toBe(20);
    session.complete();
    session.complete();
    expect(() => session.updateLocation(new LocationPing({ latitude: 20, longitude: 75 }))).toThrow('non-active');
    const cancelled = new TrackingSession({ bookingId: 2, partnerId: 2, customerId: 3, currentLatitude: 18.5, currentLongitude: 73.8 });
    cancelled.cancel(); cancelled.cancel();
    const completed = new TrackingSession({ bookingId: 3, partnerId: 2, customerId: 3, currentLatitude: 18.5, currentLongitude: 73.8 });
    completed.complete(); completed.cancel();
    expect(completed.status).toBe('COMPLETED');
  });
});
