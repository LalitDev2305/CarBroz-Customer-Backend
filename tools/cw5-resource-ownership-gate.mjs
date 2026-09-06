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

function requireText(file, source, text, rule, detail) {
  if (!source.includes(text)) violations.push({ file, rule, detail });
}

function requireRegex(file, source, regex, rule, detail) {
  if (!regex.test(source)) violations.push({ file, rule, detail });
}

function forbidText(file, source, text, rule, detail) {
  if (source.includes(text)) violations.push({ file, rule, detail });
}

function forbidRegex(file, source, regex, rule, detail) {
  if (regex.test(source)) violations.push({ file, rule, detail });
}

const bookingPolicyPath = 'domains/booking/application/security/BookingAccessPolicy.ts';
const bookingPolicy = read(bookingPolicyPath);
requireText(bookingPolicyPath, bookingPolicy, 'findByUserId(userId)', 'customer-profile-ownership', 'booking access must map authenticated User to CustomerProfile');
requireRegex(bookingPolicyPath, bookingPolicy, /membership\.status\s*!==\s*['"]ACTIVE['"]/, 'partner-membership', 'booking partner access must require ACTIVE membership');
requireText(bookingPolicyPath, bookingPolicy, 'findByPublicId(bookingPublicId)', 'booking-public-id', 'externally addressed bookings must resolve by publicId');

const bookingUseCasesPath = 'domains/booking/application/BookingUseCases.ts';
const bookingUseCases = read(bookingUseCasesPath);
requireRegex(bookingUseCasesPath, bookingUseCases, /address\.userId\s*!==\s*context\.actor\.id/, 'address-ownership', 'booking creation must prove the address belongs to the authenticated User');
requireText(bookingUseCasesPath, bookingUseCases, 'bookingAccessPolicy.assertPartnerAccess', 'partner-ownership', 'booking state transitions must use canonical partner access policy');
forbidText(bookingUseCasesPath, bookingUseCases, 'context.actor.partnerId', 'transport-identity-leak', 'application authorization must not depend on a transport-populated actor.partnerId');

for (const [file, method] of [
  ['domains/engagement/review/application/use-cases/SubmitReviewUseCase.ts', 'requireCustomerBooking'],
  ['domains/engagement/coupon/application/use-cases/ApplyCouponUseCase.ts', 'requireCustomerBooking'],
]) {
  const source = read(file);
  requireText(file, source, 'BookingAccessPolicy', 'booking-policy', 'user-owned booking operations must use BookingAccessPolicy');
  requireText(file, source, `bookingAccessPolicy.${method}`, 'booking-policy', `operation must call ${method}`);
}

const disputePath = 'domains/dispute/application/use-cases/RaiseDisputeUseCase.ts';
const dispute = read(disputePath);
requireText(disputePath, dispute, 'BookingAccessPolicy', 'booking-policy', 'dispute ownership must use BookingAccessPolicy');
requireText(disputePath, dispute, 'requireCustomerBooking', 'customer-ownership', 'customer disputes must prove booking ownership');
requireText(disputePath, dispute, 'requirePartnerBooking', 'partner-ownership', 'partner disputes must prove assigned partner membership');

const customerRoutesPath = 'apps/api/src/surfaces/customer/routes/customer.customer.routes.ts';
const customerRoutes = read(customerRoutesPath);
requireText(customerRoutesPath, customerRoutes, ':addressPublicId', 'address-public-id', 'customer address mutations must expose addressPublicId');
forbidText(customerRoutesPath, customerRoutes, ':addressId', 'numeric-address-boundary', 'numeric address IDs must not be exposed at the HTTP boundary');

const customerControllerPath = 'apps/api/src/surfaces/customer/controllers/customer.customer.controller.ts';
const customerController = read(customerControllerPath);
requireText(customerControllerPath, customerController, 'addressPublicId: req.params.addressPublicId', 'address-public-id', 'controller must pass opaque address publicId without conversion');
forbidRegex(customerControllerPath, customerController, /parseInt\s*\(\s*req\.params\.address/, 'numeric-address-boundary', 'address public IDs must never be parsed as integers');

const customerUseCasesPath = 'domains/customer/application/CustomerUseCases.ts';
const customerUseCases = read(customerUseCasesPath);
requireRegex(customerUseCasesPath, customerUseCases, /actor\.id\s*===\s*userId/, 'user-identity', 'customer ownership must compare authenticated User.id to userId');
requireText(customerUseCasesPath, customerUseCases, 'if (!actor) return false;', 'unauthenticated-actor', 'customer authorization must fail closed when actor is absent');
requireText(customerUseCasesPath, customerUseCases, 'addressPublicId?: string', 'address-public-id', 'address application contract must accept addressPublicId');
requireText(customerUseCasesPath, customerUseCases, 'findByPublicId(addressPublicId)', 'address-public-id', 'address mutation must resolve publicId before ownership check');
forbidText(customerUseCasesPath, customerUseCases, 'actor.customerId', 'mixed-id-space', 'Customer application authorization must not mix User.id and CustomerProfile.id spaces');

const addressPortPath = 'domains/customer/address/domain/repositories/IAddressRepository.ts';
const addressPort = read(addressPortPath);
requireText(addressPortPath, addressPort, 'findByPublicId(publicId: string)', 'address-public-id', 'Address repository port must support publicId resolution');

const addressRepoPath = 'domains/customer/address/infrastructure/repositories/PrismaAddressRepository.ts';
const addressRepo = read(addressRepoPath);
requireText(addressRepoPath, addressRepo, 'findByPublicId(publicId: string)', 'address-public-id', 'Prisma Address adapter must implement publicId resolution');
requireText(addressRepoPath, addressRepo, 'where: { publicId, deletedAt: null }', 'soft-delete-boundary', 'publicId lookup must not expose soft-deleted addresses');

const partnerRoutesPath = 'apps/api/src/surfaces/partner/routes/partner.kyc.routes.ts';
const partnerRoutes = read(partnerRoutesPath);
requireText(partnerRoutesPath, partnerRoutes, ':partnerPublicId/kyc', 'partner-public-id', 'Partner KYC status route must expose partnerPublicId');
forbidText(partnerRoutesPath, partnerRoutes, ':partnerId/kyc', 'numeric-partner-boundary', 'numeric Partner IDs must not be exposed on KYC routes');

const partnerControllerPath = 'apps/api/src/surfaces/partner/controllers/partner.kyc.controller.ts';
const partnerController = read(partnerControllerPath);
requireText(partnerControllerPath, partnerController, 'fields.partnerPublicId', 'partner-public-id', 'KYC upload must accept partnerPublicId');
requireRegex(partnerControllerPath, partnerController, /Params:\s*\{\s*partnerPublicId:\s*string\s*\}/, 'partner-public-id', 'KYC status controller must accept partnerPublicId');
forbidText(partnerControllerPath, partnerController, 'parseInt(', 'numeric-partner-boundary', 'KYC controller must not parse resource identifiers as integers');

for (const file of [
  'domains/partner/application/use-cases/GetPartnerKycStatusUseCase.ts',
  'domains/partner/application/use-cases/UploadKycDocumentUseCase.ts',
]) {
  const source = read(file);
  requireText(file, source, 'partnerPublicId: string', 'partner-public-id', 'Partner KYC application contract must accept partnerPublicId');
  requireText(file, source, 'partnerRepository.findByPublicId', 'partner-public-id', 'Partner KYC use case must resolve publicId to internal ID');
  requireRegex(file, source, /membership\.status\s*!==\s*['"]ACTIVE['"]/, 'active-membership', 'Partner KYC authorization must require ACTIVE membership');
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
