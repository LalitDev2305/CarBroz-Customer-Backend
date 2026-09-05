import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const API_BOOKING_USE_CASES = [
  'apps/api/src/modules/booking/use-cases/CreateBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/ConfirmBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/AssignPartnerToBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/TransitionBookingStatusUseCase.ts',
  'apps/api/src/modules/booking/use-cases/CancelBookingUseCase.ts',
  'apps/api/src/modules/booking/use-cases/ExpirePendingBookingsUseCase.ts',
];

function read(path: string): string {
  return readFileSync(path, 'utf8').trim();
}

describe('API Booking ownership policy', () => {
  it('keeps Booking application behavior out of apps/api', () => {
    const violations = API_BOOKING_USE_CASES.filter((path) => {
      const source = read(path);
      return !source.includes("from '@carbroz/domain-booking'") || /\bclass\s+\w+UseCase\b/.test(source);
    });

    expect(
      violations,
      `Booking application behavior leaked back into apps/api:\n${violations.join('\n')}`,
    ).toEqual([]);
  });

  it('keeps Booking implementation authority inside domains/booking/application', () => {
    const source = read('domains/booking/application/BookingUseCases.ts');
    const requiredOwners = [
      'CreateBookingUseCase',
      'ConfirmBookingUseCase',
      'AssignPartnerToBookingUseCase',
      'TransitionBookingStatusUseCase',
      'CancelBookingUseCase',
      'ExpirePendingBookingsUseCase',
    ];
    const missing = requiredOwners.filter((name) => !source.includes(`class ${name}`));
    expect(missing, `Booking use-case owners missing from domain application layer:\n${missing.join('\n')}`).toEqual([]);
  });
});
