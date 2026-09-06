import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

describe('API Booking ownership policy', () => {
  it('removes Booking application behavior from apps/api', () => {
    const offenders = walk(path.join(root, 'apps/api/src'))
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => /class\s+\w+UseCase\b/.test(fs.readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('keeps Booking lifecycle in Booking and dispatch assignment in Operations', () => {
    const booking = fs.readFileSync(path.join(root, 'domains/booking/application/BookingUseCases.ts'), 'utf8');
    for (const owner of ['CreateBookingUseCase', 'ConfirmBookingUseCase', 'TransitionBookingStatusUseCase', 'CancelBookingUseCase', 'ExpirePendingBookingsUseCase']) {
      expect(booking).toContain('class ' + owner);
    }
    expect(booking).not.toContain('class AssignPartnerToBookingUseCase');

    const dispatch = fs.readFileSync(path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts'), 'utf8');
    const operationsPublic = fs.readFileSync(path.join(root, 'domains/operations/public/index.ts'), 'utf8');
    expect(dispatch).toContain('class AssignPartnerToBookingUseCase');
    expect(operationsPublic).toContain('AssignPartnerToBookingUseCase');
  });
});
