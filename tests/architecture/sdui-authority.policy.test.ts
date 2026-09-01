import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const LEGACY_SDUI_PATHS = [
  'packages/ui-sdk/',
  'shared/ui-sdk/',
  'packages/common/src/domain/sdui/',
];

const LEGACY_SDUI_TERMS = [
  'SduiSubcomponent',
  'SduiChild',
  'SduiChildrenData',
  'Subcomponent',
  'ChildrenData',
  'subcomponents',
  'childrenData',
];

function git(args: string[]): string {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `git ${args.join(' ')} failed with status ${result.status}`);
  }

  return result.stdout ?? '';
}

describe('SDUI authority policy', () => {
  it('has no legacy SDUI package authority', () => {
    const trackedFiles = git(['ls-files'])
      .split(/\r?\n/)
      .filter(Boolean);

    const violations = trackedFiles.filter((path) => LEGACY_SDUI_PATHS.some((prefix) => path.startsWith(prefix)));
    expect(violations, `Legacy SDUI authority paths:\n${violations.join('\n')}`).toEqual([]);
  });

  it('has no legacy hierarchy terminology in production TypeScript', () => {
    const output = git(['grep', '-n', '-E', LEGACY_SDUI_TERMS.join('|'), '--', '*.ts']);

    const matches = output
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.startsWith('tests/architecture/sdui-authority.policy.test.ts:'));

    expect(matches, `Legacy SDUI hierarchy terms:\n${matches.join('\n')}`).toEqual([]);
  });
});
