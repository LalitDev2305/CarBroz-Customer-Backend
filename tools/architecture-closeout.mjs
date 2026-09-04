import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const previous = execFileSync('git', ['show', 'HEAD^:tools/architecture-closeout.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const workerPatch = String.raw`
const residueCleanup = String.raw\`
function cleanupCloseoutResidue() {
  for (const file of walk(root, (f) => f.endsWith('.ts'))) {
    let content = read(file);

    content = content.replace(/import\\(['\"]@carbroz\\/common['\"]\\)\\.([A-Za-z0-9_]+)/g, (full, symbol) => {
      const owner = ownership.get(symbol);
      return owner ? "import('" + owner + "')." + symbol : full;
    });

    if (rel(file) === 'apps/api/src/transport/auth/auth.controller.ts') {
      content = content.replace(
        /import\\s*\\{\\s*ResponseHelper\\s*\\}\\s*from\\s*['\"]@carbroz\\/common['\"];?/g,
        "import { ResponseHelper } from '../response/ResponseHelper.js';",
      );
      content = content.replace(
        /\\s*request\\.log\\.info\\([^;]*(?:Mock OTP|mockOtp|phoneNumber|deviceId)[^;]*;?/gi,
        "\\n    request.log.info({ event: 'auth.otp.request.completed', correlationId: request.traceId }, 'auth.otp.request.completed');",
      );
    }

    if (rel(file) === 'foundation/kernel/src/errors/errors.ts') {
      content = content.replaceAll('@carbroz/common', 'the removed legacy compatibility package');
      content = content.replaceAll('during Backend V3 migration', 'for stable transport compatibility');
      content = content.replaceAll('Transitional name retained for existing API consumers.', 'Compatibility alias retained for stable application-error identity.');
    }

    write(file, content);
  }
}
\`;
workerSource = workerSource.replace('function addDocumentationComments() {', residueCleanup + '\\nfunction addDocumentationComments() {');
workerSource = workerSource.replace(
  'rewriteCommonImports();\\nrewriteRelativeImports();\\naddDocumentationComments();',
  'rewriteCommonImports();\\ncleanupCloseoutResidue();\\nrewriteRelativeImports();\\naddDocumentationComments();',
);
workerSource = workerSource.replace(
  "if (content.includes('@carbroz/common')) violations.push(\`\${rel(file)} imports @carbroz/common\`);",
  "if (/(?:from\\\\s+['\\\"]@carbroz\\\\/common['\\\"]|import\\\\s*\\\\(\\\\s*['\\\"]@carbroz\\\\/common['\\\"]\\\\s*\\\\)|require\\\\s*\\\\(\\\\s*['\\\"]@carbroz\\\\/common['\\\"]\\\\s*\\\\))/.test(content)) violations.push(\`\${rel(file)} imports @carbroz/common\`);",
);
`;

let driverSource = previous.replace(
  "const worker = p('.architecture-closeout-worker.mjs');",
  `${workerPatch}\nconst worker = p('.architecture-closeout-worker.mjs');`,
);

const driver = path.join(root, '.architecture-closeout-driver.mjs');
fs.writeFileSync(driver, driverSource);

try {
  execFileSync(process.execPath, ['--check', driver], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [driver], { cwd: root, stdio: 'inherit' });
} finally {
  fs.rmSync(driver, { force: true });
}
