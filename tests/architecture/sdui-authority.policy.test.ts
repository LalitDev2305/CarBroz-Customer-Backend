import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const finalDescribe = existsSync('packages') ? describe.skip : describe;
const legacyPaths = [
  'packages/sdui-engine/', 'domains/sdui-registry/', 'packages/ui-sdk/', 'shared/ui-sdk/', 'packages/common/src/domain/sdui/',
];
const legacyTerms = ['SduiSubcomponent', 'SduiChild', 'SduiChildrenData', 'Subcomponent', 'ChildrenData', 'subcomponents', 'childrenData'];

function git(args: string[]): string {
  const result = spawnSync('git', args, { encoding: 'utf8', cwd: process.cwd() });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout ?? '';
}

finalDescribe('SDUI authority policy', () => {
  it('has no legacy SDUI package authority', () => {
    const tracked = git(['ls-files']).split(/\r?\n/).filter(Boolean);
    expect(tracked.filter((file) => legacyPaths.some((prefix) => file.startsWith(prefix)))).toEqual([]);
  });

  it('has no legacy hierarchy terminology in production TypeScript', () => {
    const output = git([
      'grep', '-n', '-E', legacyTerms.join('|'), '--',
      'apps/**/*.ts', 'domains/**/*.ts', 'sdui/**/*.ts', 'platform/**/*.ts', 'foundation/**/*.ts',
    ]);
    expect(output.split(/\r?\n/).filter(Boolean), `Legacy SDUI hierarchy terms:\n${output}`).toEqual([]);
  });
});
