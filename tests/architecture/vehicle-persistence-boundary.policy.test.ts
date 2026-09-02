import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('vehicle persistence boundary', () => {
  it('keeps Vehicle persistence inside the canonical Customer garage subfeature', () => {
    expect(existsSync(resolve(root, 'domains/customer/garage/infrastructure/repositories/PrismaVehicleRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'domains/garage'))).toBe(false);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaVehicleRepository.ts'))).toBe(false);
  });

  it('does not export or own Vehicle persistence from platform/database', () => {
    const databaseIndex = read('platform/database/src/index.ts');
    const databasePackage = read('platform/database/package.json');

    expect(databaseIndex).not.toContain('PrismaVehicleRepository');
    expect(databasePackage).not.toContain('@carbroz/domain-garage');
    expect(databasePackage).not.toContain('@carbroz/domain-customer');
  });

  it('lets the canonical Customer module own vehicle composition', () => {
    const customerModule = read('domains/customer/customer.module.ts');
    const garageModule = read('domains/customer/garage/garage.module.ts');

    expect(customerModule).toContain('registerGarageModule(container)');
    expect(garageModule).toContain('vehicleRepository');
    expect(garageModule).toContain('createVehicleUseCase');
  });

  it('keeps vehicle business use cases out of the API transport app', () => {
    expect(existsSync(resolve(root, 'apps/api/src/modules/vehicle/use-cases/CreateVehicleUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/api/src/modules/vehicle/use-cases/ListCustomerVehiclesUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/api/src/modules/vehicle/use-cases/SetDefaultVehicleUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/api/src/modules/vehicle/use-cases/ArchiveVehicleUseCase.ts'))).toBe(false);
  });
});
