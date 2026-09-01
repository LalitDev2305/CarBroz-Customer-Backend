import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('booking persistence boundary', () => {
  it('keeps the Booking repository implementation inside the Booking bounded context', () => {
    expect(existsSync(resolve(root, 'domains/booking/infrastructure/repositories/PrismaBookingRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaBookingRepository.ts'))).toBe(false);
  });

  it('does not export or depend on Booking persistence from platform/database', () => {
    const databaseIndex = read('platform/database/src/index.ts');
    const databasePackage = read('platform/database/package.json');

    expect(databaseIndex).not.toContain('PrismaBookingRepository');
    expect(databasePackage).not.toContain('@carbroz/domain-booking');
  });

  it('lets the Booking module own DI registration for bookingRepository', () => {
    const bookingModule = read('domains/booking/booking.module.ts');
    const apiContainer = read('apps/backend-api/src/container/index.ts');

    expect(bookingModule).toContain('bookingRepository');
    expect(apiContainer).toContain('registerBookingModule(diContainer)');
    expect(apiContainer).not.toContain('asClass(PrismaBookingRepository)');
  });
});
