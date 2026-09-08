import { describe, expect, it } from 'vitest';
import { ResponseHelper } from './ResponseHelper.js';

describe('ResponseHelper', () => {
  it('builds the canonical success envelope', () => {
    expect(ResponseHelper.success({ id: 'screen' }, 'Screen fetched successfully.', 'trace-1')).toEqual({
      status: 200,
      code: 'SUCCESS',
      message: 'Screen fetched successfully.',
      data: { id: 'screen' },
      traceId: 'trace-1',
    });
  });

  it.each([
    [400, 'BAD_REQUEST'],
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [422, 'UNPROCESSABLE_ENTITY'],
    [500, 'INTERNAL_SERVER_ERROR'],
  ] as const)('maps HTTP %s to %s', (status, code) => {
    expect(ResponseHelper.error(status, 'Request failed.', 'trace-2')).toEqual({
      status,
      code,
      message: 'Request failed.',
      data: null,
      traceId: 'trace-2',
    });
  });
});
