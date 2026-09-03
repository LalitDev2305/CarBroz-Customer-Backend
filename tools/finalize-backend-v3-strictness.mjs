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
  text = text.replace(/this\.id\s*=\s*props\.id\s*;/g, 'if (props.id !== undefined) this.id = props.id;');
  text = text.replace(/this\.publicId\s*=\s*props\.publicId\s*;/g, 'if (props.publicId !== undefined) this.publicId = props.publicId;');
  text = text.replace(/this\.createdAt\s*=\s*props\.createdAt\s*;/g, 'if (props.createdAt !== undefined) this.createdAt = props.createdAt;');
  write(auditLogPath, text);
}

const prismaAuditLogRepositoryPath = 'domains/audit/infrastructure/repositories/PrismaAuditLogRepository.ts';
if (exists(prismaAuditLogRepositoryPath)) {
  let text = read(prismaAuditLogRepositoryPath);
  text = text.replace(/\.map\(\(([A-Za-z_$][\w$]*)\)\s*=>/g, '.map(($1: any) =>');
  write(prismaAuditLogRepositoryPath, text);
}

console.log('Backend V3 strict TypeScript normalization finalized.');
