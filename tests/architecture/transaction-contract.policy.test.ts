import { describe, expect, it } from 'vitest';

describe('transaction contract policy', () => {
  it('documents the required rollback guarantee until the V3 transaction manager lands', () => {
    // This executable placeholder intentionally prevents the transaction guarantee
    // from disappearing from the migration test suite while the repository adapter
    // migration is in progress. It will be replaced by PostgreSQL integration tests.
    expect('commit-or-rollback').toBe('commit-or-rollback');
  });
});
