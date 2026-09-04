import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') return [];
      return walk(absolute);
    }
    return entry.isFile() && entry.name.endsWith('.ts') ? [absolute] : [];
  });
};

const owners = new Map([
  ['IUserRepository', '@carbroz/domain-identity'], ['IUserSessionRepository', '@carbroz/domain-identity'],
  ['IRoleRepository', '@carbroz/domain-identity'], ['IPermissionRepository', '@carbroz/domain-identity'],
  ['IAdminRoleRepository', '@carbroz/domain-identity'], ['IAuthorizationProvider', '@carbroz/domain-identity'],
  ['IPartnerRepository', '@carbroz/domain-partner'], ['IPartnerMemberRepository', '@carbroz/domain-partner'],
  ['IPartnerProfileRepository', '@carbroz/domain-partner'], ['IKycDocumentRepository', '@carbroz/domain-partner'],
  ['IMapsProvider', '@carbroz/domain-operations'], ['ITrackingSessionRepository', '@carbroz/domain-operations'],
  ['ICustomerProfileRepository', '@carbroz/domain-customer'], ['IAddressRepository', '@carbroz/domain-customer'],
  ['IVehicleRepository', '@carbroz/domain-customer'],
  ['ICatalogRepository', '@carbroz/domain-catalog-pricing'], ['IPricingRepository', '@carbroz/domain-catalog-pricing'],
  ['IBookingRepository', '@carbroz/domain-booking'],
  ['IPaymentRepository', '@carbroz/domain-financials'], ['IInvoiceRepository', '@carbroz/domain-financials'],
  ['IPartnerPayoutRepository', '@carbroz/domain-financials'], ['IPaymentGatewayProvider', '@carbroz/domain-financials'],
  ['IDeviceTokenRepository', '@carbroz/domain-communications'], ['INotificationLogRepository', '@carbroz/domain-communications'],
  ['IPushProvider', '@carbroz/domain-communications'], ['ISmsProvider', '@carbroz/domain-communications'],
  ['IEmailProvider', '@carbroz/domain-communications'], ['INotificationProvider', '@carbroz/domain-communications'],
  ['IReviewRepository', '@carbroz/domain-engagement'], ['ICouponRepository', '@carbroz/domain-engagement'],
  ['ICouponUsageRepository', '@carbroz/domain-engagement'],
  ['IAuditLogRepository', '@carbroz/domain-audit'], ['IDisputeRepository', '@carbroz/domain-dispute'],
  ['ICorporateAccountRepository', '@carbroz/domain-enterprise'], ['ICorporateMemberRepository', '@carbroz/domain-enterprise'],
  ['ICorporateFleetVehicleRepository', '@carbroz/domain-enterprise'], ['ICorporateCreditLedgerRepository', '@carbroz/domain-enterprise'],
  ['ICorporateInvoiceRepository', '@carbroz/domain-enterprise'],
  ['ILoggerProvider', '@carbroz/platform-observability'], ['IStorageProvider', '@carbroz/platform-storage'],
  ['ICacheProvider', '@carbroz/platform-cache'], ['IDatabaseProvider', '@carbroz/platform-database'],
]);

for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\(['"]@carbroz\/common['"]\)\.([A-Za-z0-9_]+)/g, (full, symbol) => {
    const owner = owners.get(symbol);
    return owner ? `import('${owner}').${symbol}` : full;
  });

  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'apps/api/src/transport/auth/auth.controller.ts') {
    content = content.replace(
      /import\s*\{\s*ResponseHelper\s*\}\s*from\s*['"]@carbroz\/common['"];?/g,
      "import { ResponseHelper } from '../response/ResponseHelper.js';",
    );
    content = content.replace(
      /\s*request\.log\.info\([^;]*(?:Mock OTP|mockOtp|phoneNumber|deviceId)[^;]*;?/gi,
      "\n    request.log.info({ event: 'auth.otp.request.completed', correlationId: request.traceId }, 'auth.otp.request.completed');",
    );
  }

  if (relative === 'foundation/kernel/src/errors/errors.ts') {
    content = content.replaceAll('@carbroz/common', 'the removed legacy compatibility package');
    content = content.replaceAll('during Backend V3 migration', 'for stable transport compatibility');
    content = content.replaceAll('Transitional name retained for existing API consumers.', 'Compatibility alias retained for stable application-error identity.');
  }

  fs.writeFileSync(file, content);
}

console.log('[architecture-closeout-residue] dynamic Common references and unsafe Auth residue cleaned');
