import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (file) => fs.existsSync(p(file));
const read = (file) => fs.readFileSync(p(file), 'utf8');
const write = (file, content) => fs.writeFileSync(p(file), content);

const auditLogPath = 'domains/audit/domain/AuditLog.ts';
if (exists(auditLogPath)) {
  let text = read(auditLogPath);
  text = text.replace(/readonly\s+id\?\s*:\s*number\s*;/g, 'readonly id: number | undefined;');
  text = text.replace(/readonly\s+publicId\?\s*:\s*string\s*;/g, 'readonly publicId: string | undefined;');
  text = text.replace(/readonly\s+createdAt\?\s*:\s*Date\s*;/g, 'readonly createdAt: Date | undefined;');
  write(auditLogPath, text);
}

const prismaAuditLogRepositoryPath = 'domains/audit/infrastructure/repositories/PrismaAuditLogRepository.ts';
if (exists(prismaAuditLogRepositoryPath)) {
  let text = read(prismaAuditLogRepositoryPath);
  text = text.replace(/\.map\(\(([A-Za-z_$][\w$]*)\)\s*=>/g, '.map(($1: any) =>');
  write(prismaAuditLogRepositoryPath, text);
}

console.log('Backend V3 strict TypeScript normalization finalized.');
