import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

function patch(relative, className) {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  const rx = new RegExp(`return new ${className}\\(\\{\\s*\\.\\.\\.model,\\s*\\.\\.\\.\\(model\\.publicId !== undefined && model\\.publicId !== null \\? \\{ publicId: model\\.publicId \\} : \\{\\}\\),\\s*\\}\\);`);
  text = text.replace(rx, `const { publicId, ...rest } = model;\n    return new ${className}({\n      ...rest,\n      ...(publicId !== undefined && publicId !== null ? { publicId } : {}),\n    });`);
  fs.writeFileSync(file, text);
}

patch('domains/customer/address/infrastructure/repositories/PrismaAddressRepository.ts', 'Address');
patch('domains/customer/profile/infrastructure/repositories/PrismaCustomerProfileRepository.ts', 'CustomerProfile');

console.log('Customer persistence hydration canonicalized.');
