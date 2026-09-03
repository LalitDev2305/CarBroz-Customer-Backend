import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function patch(relative, transform) {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
}

// Partner application input contracts belong to Partner application, not the
// Partner HTTP DTO surface. HTTP schemas can map structurally to these inputs.
for (const [relative, dtoName] of [
  ['domains/partner/application/self-service/RegisterIndividualPartnerUseCase.ts', 'RegisterIndividualPartnerDto'],
  ['domains/partner/application/self-service/RegisterOrganizationPartnerUseCase.ts', 'RegisterOrganizationPartnerDto'],
]) {
  patch(relative, (text) => {
    text = text.replace(/^import .*partner\.dto\.js.*\n/m, '');
    if (!text.includes(`export interface ${dtoName}`)) {
      const marker = 'export class ';
      text = text.replace(marker, `export interface ${dtoName} {\n  businessName: string;\n}\n\n${marker}`);
    }
    return text;
  });
}

patch('domains/partner/application/administration/VerifyPartnerUseCase.ts', (text) => {
  text = text.replace(/^import .*partner\.dto\.js.*\n/m, '');
  if (!text.includes('export interface VerifyPartnerDto')) {
    text = text.replace('export class ', "export interface VerifyPartnerDto {\n  status: 'ACTIVE' | 'SUSPENDED' | 'REJECTED';\n}\n\nexport class ");
  }
  return text;
});

// Tests stay with the owning application use case and must not depend on API DTOs.
patch('domains/partner/application/self-service/RegisterIndividualPartnerUseCase.spec.ts', (text) =>
  text.replace(/^import .*partner\.dto\.js.*\n/m, '')
);
patch('domains/partner/application/self-service/RegisterOrganizationPartnerUseCase.spec.ts', (text) =>
  text.replace(/^import .*partner\.dto\.js.*\n/m, '')
);

// Booking owns only the capability it needs from Partner. The concrete Partner
// repository can satisfy this structural port at composition time without a
// Booking -> Partner package dependency.
patch('domains/booking/application/AssignPartnerToBookingUseCase.ts', (text) => {
  text = text.replace(/^import .*IPartnerRepository.*@carbroz\/domain-partner.*\n/m, '');
  text = text.replace(/^import .*IPartnerRepository.*@carbroz\/common.*\n/m, '');
  if (!text.includes('interface PartnerAssignmentRepositoryPort')) {
    const port = `interface PartnerAssignmentRepositoryPort {\n  findById(id: number): Promise<{ status: string } | null>;\n}\n\n`;
    text = text.replace('export class AssignPartnerToBookingUseCase', `${port}export class AssignPartnerToBookingUseCase`);
  }
  text = text.replace(/private readonly partnerRepository:\s*IPartnerRepository/g, 'private readonly partnerRepository: PartnerAssignmentRepositoryPort');
  return text;
});

// Booking completion may trigger Financials, but Booking must not import the
// Financials implementation. Composition injects any compatible handler.
patch('domains/booking/application/TransitionBookingStatusUseCase.ts', (text) => {
  text = text.replace(/^import .*CreatePayoutEligibilityUseCase.*\n/m, '');
  if (!text.includes('interface BookingCompletionFinancialPort')) {
    const port = `interface BookingCompletionFinancialPort {\n  execute(bookingId: number): Promise<unknown>;\n}\n\n`;
    text = text.replace('export interface TransitionBookingStatusInput', `${port}export interface TransitionBookingStatusInput`);
  }
  text = text.replace(/private readonly createPayoutEligibilityUseCase\?:\s*CreatePayoutEligibilityUseCase/g, 'private readonly createPayoutEligibilityUseCase?: BookingCompletionFinancialPort');
  return text;
});

// exactOptionalPropertyTypes: absence is represented by omission, not explicit
// undefined. Nullable persistence fields are normalized to null.
patch('domains/booking/domain/Booking.ts', (text) =>
  text.replace(/\s*note,\n\s*\}\);/, "\n      ...(note !== undefined ? { note } : {}),\n    });")
);

patch('domains/booking/infrastructure/repositories/PrismaBookingRepository.ts', (text) =>
  text
    .replace('partnerId: record.partnerId ?? undefined,', 'partnerId: record.partnerId ?? null,')
    .replace('expiryAt: record.expiryAt ?? undefined,', 'expiryAt: record.expiryAt ?? null,')
    .replace('cancellationReason: record.cancellationReason ?? undefined,', 'cancellationReason: record.cancellationReason ?? null,')
);

console.log('Backend V3 domain dependency boundaries finalized.');
