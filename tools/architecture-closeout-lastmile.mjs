import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bookingUseCases = path.join(root, 'domains/booking/application/BookingUseCases.ts');
if (!fs.existsSync(bookingUseCases)) throw new Error('Booking application file missing during last-mile closeout');

let source = fs.readFileSync(bookingUseCases, 'utf8');
const classStart = source.indexOf('export class AssignPartnerToBookingUseCase');
const nextBoundary = source.indexOf('export interface TransitionBookingStatusInput', classStart);
if (classStart >= 0) {
  if (nextBoundary <= classStart) throw new Error('Unable to locate deterministic boundary after Booking dispatch class');
  source = source.slice(0, classStart) + source.slice(nextBoundary);
}
source = source.replace(/^import type \{ IPartnerRepository \} from '@carbroz\/domain-partner';\r?\n/m, '');
if (source.includes('AssignPartnerToBookingUseCase') || source.includes('IPartnerRepository')) {
  throw new Error('Booking still retains dispatch/Partner repository authority after last-mile closeout');
}
fs.writeFileSync(bookingUseCases, source);

const operationsDispatch = path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts');
const operationsPublic = path.join(root, 'domains/operations/public/index.ts');
if (!fs.existsSync(operationsDispatch)) throw new Error('Operations dispatch owner was not created');
if (!fs.existsSync(operationsPublic) || !fs.readFileSync(operationsPublic, 'utf8').includes('AssignPartnerToBookingUseCase')) {
  throw new Error('Operations dispatch owner is not publicly exposed');
}

console.log('[architecture-closeout-lastmile] Booking dispatch duplicate removed; Operations is the single assignment owner');
