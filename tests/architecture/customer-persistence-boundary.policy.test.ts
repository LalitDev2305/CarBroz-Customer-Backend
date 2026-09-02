import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('customer persistence boundary', () => {
  it('keeps Customer Profile and Address repositories inside domains/customer', () => {
    expect(existsSync(resolve(root, 'domains/customer/profile/infrastructure/repositories/PrismaCustomerProfileRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'domains/customer/address/infrastructure/repositories/PrismaAddressRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaCustomerProfileRepository.ts'))).toBe(false);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaAddressRepository.ts'))).toBe(false);
  });

  it('keeps domain-owned repository ports out of packages/common ownership', () => {
    expect(existsSync(resolve(root, 'domains/customer/profile/domain/repositories/ICustomerProfileRepository.ts'))).toBe(true);
    expect(existsSync(resolve(root, 'domains/customer/address/domain/repositories/IAddressRepository.ts'))).toBe(true);

    const profileRepository = read('domains/customer/profile/infrastructure/repositories/PrismaCustomerProfileRepository.ts');
    const addressRepository = read('domains/customer/address/infrastructure/repositories/PrismaAddressRepository.ts');

    expect(profileRepository).not.toContain('@carbroz/common');
    expect(addressRepository).not.toContain('@carbroz/common');
    expect(profileRepository).not.toContain('@prisma/client');
    expect(addressRepository).not.toContain('@prisma/client');
  });

  it('uses one canonical Customer workspace identity and composition module', () => {
    const customerPackage = JSON.parse(read('domains/customer/package.json')) as { name?: string };
    const customerModule = read('domains/customer/customer.module.ts');

    expect(customerPackage.name).toBe('@carbroz/domain-customer');
    expect(customerModule).toContain('registerCustomerProfileModule(container)');
    expect(customerModule).toContain('registerAddressModule(container)');
    expect(customerModule).toContain('registerGarageModule(container)');
  });

  it('keeps platform/database independent from Customer domain packages', () => {
    const databaseIndex = read('platform/database/src/index.ts');
    const databasePackage = read('platform/database/package.json');

    expect(databaseIndex).not.toContain('PrismaCustomerProfileRepository');
    expect(databaseIndex).not.toContain('PrismaAddressRepository');
    expect(databasePackage).not.toContain('@carbroz/domain-customer');
    expect(databasePackage).not.toContain('@carbroz/domain-customer-profile');
    expect(databasePackage).not.toContain('@carbroz/domain-address');
  });
});
