import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('partner KYC persistence boundary', () => {
  it('keeps the KYC repository implementation inside the Partner bounded context', () => {
    expect(
      existsSync(resolve(root, 'domains/partner/kyc/infrastructure/repositories/PrismaKycDocumentRepository.ts')),
    ).toBe(true);
    expect(existsSync(resolve(root, 'platform/database/src/repositories/PrismaKycDocumentRepository.ts'))).toBe(false);
  });

  it('does not export or depend on Partner KYC persistence from platform/database', () => {
    const databaseIndex = read('platform/database/src/index.ts');
    const databasePackage = read('platform/database/package.json');

    expect(databaseIndex).not.toContain('PrismaKycDocumentRepository');
    expect(databasePackage).not.toContain('@carbroz/domain-partner-kyc');
  });

  it('lets the Partner KYC module own DI registration for kycDocumentRepository', () => {
    const kycModule = read('domains/partner/kyc/partner-kyc.module.ts');

    expect(kycModule).toContain('kycDocumentRepository');
    expect(kycModule).toContain('PrismaKycDocumentRepository');
    expect(kycModule).toContain('prismaProvider.getClient()');
  });
});
