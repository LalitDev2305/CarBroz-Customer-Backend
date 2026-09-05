import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const finalDescribe = existsSync(resolve(root, 'packages')) ? describe.skip : describe;
const read = (file: string): string => readFileSync(resolve(root, file), 'utf8');

finalDescribe('booking persistence boundary', () => {
  it('keeps the Booking repository implementation inside the Booking bounded context', () => {
    expect(existsSync(resolve(root, 'domains/booking/infrastructure/repositories/PrismaBookingRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaBookingRepository.ts'))).toBe(false);
  });

  it('does not export or depend on Booking persistence from platform/database', () => {
    expect(read('platform/database/src/index.ts')).not.toContain('PrismaBookingRepository');
    expect(read('platform/database/package.json')).not.toContain('@carbroz/domain-booking');
  });

  it('lets Booking own repository registration while API only composes the module', () => {
    const bookingModule = read('domains/booking/booking.module.ts');
    const apiContainer = read('apps/api/src/bootstrap/container/index.ts');
    expect(bookingModule).toContain('bookingRepository');
    expect(apiContainer).toContain('registerBookingModule');
    expect(apiContainer).not.toContain('asClass(PrismaBookingRepository)');
  });
});
