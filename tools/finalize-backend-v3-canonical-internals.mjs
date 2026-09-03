import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function patch(relative, transform) {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}

// Catalog/Pricing repository ports live inside capability-local trees. Their
// imports must therefore be relative to those trees, while universal repository
// primitives are consumed from Foundation's public package.
patch('domains/catalog-pricing/catalog/domain/repositories/ICatalogRepository.ts', (text) => {
  text = text.replace(/^import .*IRepository.*$/m, "import type { IRepository } from '@carbroz/foundation-kernel';");
  text = text.replace(/^import .*ServiceCategory.*$/m, "import type { ServiceCategory } from '../ServiceCategory.js';");
  text = text.replace(/^import .*Service .*$/m, "import type { Service } from '../Service.js';");
  text = text.replace(/^import .*ServiceAddon.*$/m, "import type { ServiceAddon } from '../ServiceAddon.js';");
  return text;
});

patch('domains/catalog-pricing/pricing/domain/repositories/IPricingRepository.ts', (text) => {
  text = text.replace(/^import .*PricingTier.*$/m, "import type { PricingTier, VehicleTypeMultiplierEntity } from '../PricingTier.js';");
  return text;
});

// Migrated Prisma adapters can lose contextual callback types while their owner
// package changes. Preserve strict noImplicitAny by typing callback records at
// the adapter boundary without weakening compiler settings.
for (const relative of [
  'domains/catalog-pricing/catalog/infrastructure/repositories/PrismaCatalogRepository.ts',
  'domains/catalog-pricing/pricing/infrastructure/repositories/PrismaPricingRepository.ts',
]) {
  patch(relative, (text) => text
    .replace(/\.map\(\(([A-Za-z_$][\w$]*)\)\s*=>/g, '.map(($1: any) =>')
    .replace(/\.map\(\s*([A-Za-z_$][\w$]*)\s*=>/g, '.map(($1: any) =>')
  );
}

// With noUncheckedIndexedAccess enabled, test assertions must state the already
// established non-empty expectation explicitly.
patch('domains/catalog-pricing/application/CatalogUseCases.spec.ts', (text) => text
  .replace(/result\[0\]\.name/g, 'result[0]!.name')
  .replace(/result\[0\]\.services/g, 'result[0]!.services')
  .replace(/result\[0\]!\.services!\[0\]\.name/g, 'result[0]!.services![0]!.name')
);

console.log('Backend V3 canonical capability internals finalized.');
