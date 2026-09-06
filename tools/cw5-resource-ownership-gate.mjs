import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const violations = [];

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    violations.push({ file, rule: 'required-file', detail: 'required ownership proof file is missing' });
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireMatch(file, source, regex, rule, detail) {
  if (!regex.test(source)) violations.push({ file, rule, detail });
}

function forbidMatch(file, source, regex, rule, detail) {
  if (regex.test(source)) violations.push({ file, rule, detail });
}

const bookingPolicyPath = 'domains/booking/application/security/BookingAccessPolicy.ts';
const bookingPolicy = read(bookingPolicyPath);
requireMatch(bookingPolicyPath, bookingPolicy, /findByUserId\(userId\)/, 'customer-profile-ownership', 'booking access must map authenticated User to CustomerProfile');
requireMatch(bookingPolicyPath, bookingPolicy, /membership\.status\s*!==\s*['"]ACTIVE['"]/, 'partner-membership', 'booking partner access must require ACTIVE membership');
requireMatch(bookingPolicyPath, bookingPolicy, /findByPublicId\(bookingPublicId\)/, 'booking-public-id', 'externally addressed bookings must resolve by publicId');

const bookingUseCasesPath = 'domains/booking/application/BookingUseCases.ts';
const bookingUseCases = read(bookingUseCasesPath);
requireMatch(bookingUseCasesPath, bookingUseCases, /address\.userId\s*!==\s*context\.actor\.id/, 'address-ownership', 'booking creation must prove the address belongs to the authenticated User');
requireMatch(bookingUseCasesPath, bookingUseCases, /bookingAccessPolicy\.assertPartnerAccess/, 'partner-ownership', 'booking state transitions must use canonical partner access policy');
forbidMatch(bookingUseCasesPath, bookingUseCases, /context\.actor\.partnerId/, 'transport-identity-leak', 'application authorization must not depend on a transport-populated actor.partnerId');

for (const [file, method] of [
  ['domains/engagement/review/application/use-cases/SubmitReviewUseCase.ts', 'requireCustomerBooking'],
  ['domains/engagement/coupon/application/use-cases/ApplyCouponUseCase.ts', 'requireCustomerBooking'],
]) {
  const source = read(file);
  requireMatch(file, source, /BookingAccessPolicy/, 'booking-policy', 'user-owned booking operations must use BookingAccessPolicy');
  requireMatch(file, source, new RegExp(`bookingAccessPolicy\\.${method}`), 'booking-policy', `operation must call ${method}`);
}

const disputePath = 'domains/dispute/application/use-cases/RaiseDisputeUseCase.ts';
const dispute = read(disputePath);
requireMatch(disputePath, dispute, /BookingAccessPolicy/, 'booking-policy', 'dispute ownership must use BookingAccessPolicy');
requireMatch(disputePath, dispute, /requireCustomerBooking/, 'customer-ownership', 'customer disputes must prove booking ownership');
requireMatch(disputePath, dispute, /requirePartnerBooking/, 'partner-ownership', 'partner disputes must prove assigned partner membership');

const customerRoutesPath = 'apps/api/src/surfaces/customer/routes/customer.customer.routes.ts';
const customerRoutes = read(customerRoutesPath);
requireMatch(customerRoutesPath, customerRoutes, /:addressPublicId/, 'address-public-id', 'customer address mutations must expose addressPublicId');
forbidMatch(customerRoutesPath, customerRoutes, /:addressId\b/, 'numeric-address-boundary', 'numeric address IDs must not be exposed at the HTTP boundary');

const customerControllerPath = 'apps/api/src/surfaces/customer/controllers/customer.customer.controller.ts';
const customerController = read(customerControllerPath);
requireMatch(customerControllerPath, customerController, /addressPublicId:\s*req\.params\.addressPublicId/, 'address-public-id', 'controller must pass opaque address publicId without conversion');
forbidMatch(customerControllerPath, customerController, /parseInt\s*\(\s*req\.params\.address/, 'numeric-address-boundary', 'address public IDs must never be parsed as integers');

const customerUseCasesPath = 'domains/customer/application/CustomerUseCases.ts';
const customerUseCases = read(customerUseCasesPath);
requireMatch(customerUseCasesPath, customerUseCases, /actor\.id\s*===\s*userId/, 'user-identity', 'customer ownership must compare authenticated User.id to userId');
requireMatch(customerUseCasesPath, customerUseCases, /addressPublicId\?:\s*string/, 'address-public-id', 'address application contract must accept addressPublicId');
requireMatch(customerUseCasesPath, customerUseCases, /findByPublicId\(addressPublicId\)/, 'address-public-id', 'address mutation must resolve publicId before ownership check');
forbidMatch(customerUseCasesPath, customerUseCases, /actor\.customerId/, 'mixed-id-space', 'Customer application authorization must not mix User.id and CustomerProfile.id spaces');

const addressPortPath = 'domains/customer/address/domain/repositories/IAddressRepository.ts';
const addressPort = read(addressPortPath);
requireMatch(addressPortPath, addressPort, /findByPublicId\(publicId:\s*string\)/, 'address-public-id', 'Address repository port must support publicId resolution');

const addressRepoPath = 'domains/customer/address/infrastructure/repositories/PrismaAddressRepository.ts';
const addressRepo = read(addressRepoPath);
requireMatch(addressRepoPath, addressRepo, /async\s+findByPublicId\(publicId:\s*string\)/, 'address-public-id', 'Prisma Address adapter must implement publicId resolution');

const partnerRoutesPath = 'apps/api/src/surfaces/partner/routes/partner.kyc.routes.ts';
const partnerRoutes = read(partnerRoutesPath);
requireMatch(partnerRoutesPath, partnerRoutes, /:partnerPublicId\/kyc/, 'partner-public-id', 'Partner KYC status route must expose partnerPublicId');
forbidMatch(partnerRoutesPath, partnerRoutes, /:partnerId\/kyc/, 'numeric-partner-boundary', 'numeric Partner IDs must not be exposed on KYC routes');

const partnerControllerPath = 'apps/api/src/surfaces/partner/controllers/partner.kyc.controller.ts';
const partnerController = read(partnerControllerPath);
requireMatch(partnerControllerPath, partnerController, /fields\.partnerPublicId/, 'partner-public-id', 'KYC upload must accept partnerPublicId');
requireMatch(partnerControllerPath, partnerController, /Params:\s*\{\s*partnerPublicId:\s*string\s*\}/, 'partner-public-id', 'KYC status controller must accept partnerPublicId');
forbidMatch(partnerControllerPath, partnerController, /parseInt\s*\(/, 'numeric-partner-boundary', 'KYC controller must not parse resource identifiers as integers');

for (const file of [
  'domains/partner/application/use-cases/GetPartnerKycStatusUseCase.ts',
  'domains/partner/application/use-cases/UploadKycDocumentUseCase.ts',
]) {
  const source = read(file);
  requireMatch(file, source, /partnerPublicId:\s*string/, 'partner-public-id', 'Partner KYC application contract must accept partnerPublicId');
  requireMatch(file, source, /partnerRepository\.findByPublicId/, 'partner-public-id', 'Partner KYC use case must resolve publicId to internal ID');
  requireMatch(file, source, /membership\.status\s*!==\s*['"]ACTIVE['"]/, 'active-membership', 'Partner KYC authorization must require ACTIVE membership');
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule));
if (violations.length === 0) {
  console.log('[cw5-resource-ownership-gate] PASS');
  process.exit(0);
}

console.log(`[cw5-resource-ownership-gate] FAILED — ${violations.length} violation(s)`);
for (const violation of violations) {
  console.log(`- ${violation.file} [${violation.rule}]: ${violation.detail}`);
}
process.exit(1);
