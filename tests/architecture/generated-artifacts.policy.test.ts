import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const FORBIDDEN_TRACKED_ARTIFACT = /(^|\/)(dist|coverage|generated)(\/|$)|\.tsbuildinfo$/;

describe('repository generated-artifact policy', () => {
  it('does not track generated build artifacts', () => {
    const trackedFiles = execFileSync('git', ['ls-files'], {
      encoding: 'utf8',
      cwd: process.cwd(),
    })
      .split(/\r?\n/)
      .filter(Boolean);

    const violations = trackedFiles.filter((path) => FORBIDDEN_TRACKED_ARTIFACT.test(path));

    expect(violations, `Tracked generated artifacts:\n${violations.join('\n')}`).toEqual([]);
  });
});
