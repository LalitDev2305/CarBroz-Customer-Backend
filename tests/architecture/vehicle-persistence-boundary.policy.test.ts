import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('vehicle persistence boundary', () => {
  it('keeps the Vehicle repository implementation inside the customer garage boundary', () => {
    expect(existsSync(resolve(root, 'domains/garage/infrastructure/repositories/PrismaVehicleRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaVehicleRepository.ts'))).toBe(false);
  });

  it('does not export or depend on Vehicle persistence from platform/database', () => {
    const databaseIndex = read('platform/database/src/index.ts');
    const databasePackage = read('platform/database/package.json');

    expect(databaseIndex).not.toContain('PrismaVehicleRepository');
    expect(databasePackage).not.toContain('@carbroz/domain-garage');
  });

  it('lets the garage module own vehicle repository and application registrations', () => {
    const garageModule = read('domains/garage/garage.module.ts');
    const apiContainer = read('apps/backend-api/src/container/index.ts');

    expect(garageModule).toContain('vehicleRepository');
    expect(garageModule).toContain('createVehicleUseCase');
    expect(apiContainer).toContain('registerGarageModule(diContainer)');
    expect(apiContainer).not.toContain('asClass(PrismaVehicleRepository)');
  });

  it('keeps vehicle application use cases out of the API transport app', () => {
    expect(existsSync(resolve(root, 'apps/backend-api/src/modules/vehicle/use-cases/CreateVehicleUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/backend-api/src/modules/vehicle/use-cases/ListCustomerVehiclesUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/backend-api/src/modules/vehicle/use-cases/SetDefaultVehicleUseCase.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'apps/backend-api/src/modules/vehicle/use-cases/ArchiveVehicleUseCase.ts'))).toBe(false);
  });
});
