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

patch('domains/partner/application/self-service/RegisterIndividualPartnerUseCase.spec.ts', (text) =>
  text.replace(/^import .*partner\.dto\.js.*\n/m, '')
);
patch('domains/partner/application/self-service/RegisterOrganizationPartnerUseCase.spec.ts', (text) =>
  text.replace(/^import .*partner\.dto\.js.*\n/m, '')
);

// Enterprise application contracts are domain-owned. Any migrated corporate
// use case that still points at the API DTO surface is redirected to the local
// application contract preserved before legacy pruning.
const enterpriseApplication = p('domains/enterprise/application');
if (fs.existsSync(enterpriseApplication)) {
  for (const entry of fs.readdirSync(enterpriseApplication, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
    patch(`domains/enterprise/application/${entry.name}`, (text) => {
      text = text.replace(/^import\s+\{([^}]*)\}\s+from\s+['"][^'"]*corporate\.dto\.js['"];?\n/m,
        (_all, names) => `import {${names}} from './contracts/corporate.contracts.js';\n`);
      text = text.replace(/^import\s+type\s+\{([^}]*)\}\s+from\s+['"][^'"]*corporate\.dto\.js['"];?\n/m,
        (_all, names) => `import type {${names}} from './contracts/corporate.contracts.js';\n`);
      return text;
    });
  }
}

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

patch('domains/booking/application/TransitionBookingStatusUseCase.ts', (text) => {
  text = text.replace(/^import .*CreatePayoutEligibilityUseCase.*\n/m, '');
  if (!text.includes('interface BookingCompletionFinancialPort')) {
    const port = `interface BookingCompletionFinancialPort {\n  execute(bookingId: number): Promise<unknown>;\n}\n\n`;
    text = text.replace('export interface TransitionBookingStatusInput', `${port}export interface TransitionBookingStatusInput`);
  }
  text = text.replace(/private readonly createPayoutEligibilityUseCase\?:\s*CreatePayoutEligibilityUseCase/g, 'private readonly createPayoutEligibilityUseCase?: BookingCompletionFinancialPort');
  return text;
});

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
