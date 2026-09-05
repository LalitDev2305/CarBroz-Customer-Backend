import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (file) => fs.existsSync(file);
const write = (rel, content) => {
  const file = p(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

// Financials already owns the canonical payment/invoice/payout orchestration in FinancialUseCases.
// Do not publish gateway-helper input/result names through the aggregate boundary where they collide
// with the application command/result contract.
write('domains/financials/public/index.ts', `export * from '../payment/domain/Payment.js';
export * from '../payment/domain/PaymentMethod.js';
export * from '../payment/domain/PaymentStatus.js';
export * from '../payment/domain/PaymentWebhook.js';
export type { IPaymentRepository } from '../payment/domain/repositories/IPaymentRepository.js';
export type { IPaymentGatewayProvider } from '../payment/application/ports/IPaymentGatewayProvider.js';
export * from '../invoice/domain/Invoice.js';
export * from '../invoice/domain/InvoiceStatus.js';
export type { IInvoiceRepository } from '../invoice/domain/repositories/IInvoiceRepository.js';
export * from '../payout/domain/PartnerPayout.js';
export * from '../payout/domain/PayoutStatus.js';
export type { IPartnerPayoutRepository } from '../payout/domain/repositories/IPartnerPayoutRepository.js';
export * from '../application/FinancialUseCases.js';
export * from '../payment/payment.module.js';
export * from '../invoice/invoice.module.js';
export * from '../payout/payout.module.js';
export * from '../financials.module.js';
`);

// The pre-existing tracking subdomain is canonical. API-migrated tracking application files are a
// second authority and must disappear rather than be aliased/exported alongside the real owner.
fs.rmSync(p('domains/operations/application/tracking'), { recursive: true, force: true });

write('domains/operations/application/maps/contracts/location.ts', `export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface AddressComponent {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}
export interface GeocodeResult {
  coordinates: Coordinates;
  address: AddressComponent;
}
export interface DistanceMatrixResult {
  distanceInMeters: number;
  durationInSeconds: number;
}
`);
write('domains/operations/application/maps/contracts/maps.ts', `export interface GeocodeRequest { address: string }
export interface ReverseGeocodeRequest { lat: number; lng: number }
export interface CalculateDistanceRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}
`);
write('domains/operations/application/maps/ports/IMapsProvider.ts', `import type { Coordinates, DistanceMatrixResult, GeocodeResult } from '../contracts/location.js';
export interface IMapsProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>;
  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
`);
write('domains/operations/application/maps/use-cases/GeocodeAddressUseCase.ts', `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { GeocodeRequest } from '../contracts/maps.js';
import type { GeocodeResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface GeocodeAddressInput { context: ExecutionContext; data: GeocodeRequest }
export class GeocodeAddressUseCase implements IUseCase<GeocodeAddressInput, GeocodeResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: GeocodeAddressInput): Promise<GeocodeResult> {
    return this.mapsProvider.geocode(input.data.address);
  }
}
`);
write('domains/operations/application/maps/use-cases/ReverseGeocodeUseCase.ts', `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { ReverseGeocodeRequest } from '../contracts/maps.js';
import type { GeocodeResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface ReverseGeocodeInput { context: ExecutionContext; data: ReverseGeocodeRequest }
export class ReverseGeocodeUseCase implements IUseCase<ReverseGeocodeInput, GeocodeResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: ReverseGeocodeInput): Promise<GeocodeResult> {
    return this.mapsProvider.reverseGeocode({ latitude: input.data.lat, longitude: input.data.lng });
  }
}
`);
write('domains/operations/application/maps/use-cases/CalculateDistanceUseCase.ts', `import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { CalculateDistanceRequest } from '../contracts/maps.js';
import type { DistanceMatrixResult } from '../contracts/location.js';
import type { IMapsProvider } from '../ports/IMapsProvider.js';
export interface CalculateDistanceInput { context: ExecutionContext; data: CalculateDistanceRequest }
export class CalculateDistanceUseCase implements IUseCase<CalculateDistanceInput, DistanceMatrixResult> {
  constructor(private readonly mapsProvider: IMapsProvider) {}
  async execute(input: CalculateDistanceInput): Promise<DistanceMatrixResult> {
    return this.mapsProvider.calculateDistance(
      { latitude: input.data.originLat, longitude: input.data.originLng },
      { latitude: input.data.destLat, longitude: input.data.destLng },
    );
  }
}
`);
fs.rmSync(p('domains/operations/application/maps/use-cases/MapsUseCases.spec.ts'), { force: true });

write('domains/operations/public/index.ts', `export * from '../tracking/public/index.js';
export * from '../application/maps/contracts/location.js';
export * from '../application/maps/contracts/maps.js';
export type { IMapsProvider } from '../application/maps/ports/IMapsProvider.js';
export * from '../application/maps/use-cases/GeocodeAddressUseCase.js';
export * from '../application/maps/use-cases/ReverseGeocodeUseCase.js';
export * from '../application/maps/use-cases/CalculateDistanceUseCase.js';
export * from '../operations.module.js';
`);

// Provider adapters must consume the owning Operations port, never API DTOs or Common.
const integrationMaps = p('platform/integrations/src/maps');
if (exists(integrationMaps)) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
  for (const file of walk(integrationMaps).filter((candidate) => candidate.endsWith('.ts'))) {
    let content = fs.readFileSync(file, 'utf8');
    content = content
      .replace(/from ['"]@carbroz\/domain-operations['"]/g, "from '@carbroz/domain-operations'")
      .replace(/from ['"][^'"]*apps\/api[^'"]*['"]/g, "from '@carbroz/domain-operations'");
    fs.writeFileSync(file, content);
  }
}

const violations = [];
for (const domain of ['domains/financials', 'domains/operations']) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
  for (const file of walk(p(domain)).filter((candidate) => candidate.endsWith('.ts'))) {
    const content = fs.readFileSync(file, 'utf8');
    if (/\bIRequestContext\b/.test(content)) violations.push(`${path.relative(root, file)} uses IRequestContext`);
    if (/from\s+['"][^'"]*apps\/api|from\s+['"][^'"]*surfaces\//.test(content)) violations.push(`${path.relative(root, file)} imports API transport`);
  }
}
if (violations.length) throw new Error(`Financials/Operations closeout boundary failed:\n${violations.map((item) => `- ${item}`).join('\n')}`);
console.log('[architecture-closeout-finops] Financials public authority and Operations maps/tracking ownership converged');
