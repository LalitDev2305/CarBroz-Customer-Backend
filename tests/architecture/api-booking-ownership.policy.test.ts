import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const legacyUseCases = [
  'apps/api/src/modules/booking/use-cases/CreateBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/ConfirmBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/AssignPartnerToBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/TransitionBookingStatusUseCase.ts',
  'apps/api/src/modules/booking/use-cases/CancelBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/ExpirePendingBookingsUseCase.ts',
];

const finalDescribe = existsSync('packages') ? describe.skip : describe;

finalDescribe('API Booking ownership policy', () => {
  it('removes Booking application behavior from apps/api', () => {
    expect(legacyUseCases.filter(existsSync)).toEqual([]);
    expect(existsSync('apps/api/src/modules/booking')).toBe(false);
  });

  it('keeps Booking implementation authority inside domains/booking/application', () => {
    const source = readFileSync('domains/booking/application/BookingUseCases.ts', 'utf8');
    for (const owner of [
      'CreateBookingUseCase',
      'ConfirmBookingUseCase',
      'AssignPartnerToBookingUseCase',
      'TransitionBookingStatusUseCase',
      'CancelBookingUseCase',
      'ExpirePendingBookingsUseCase',
    ]) expect(source).toContain(`class ${owner}`);
  });
});
