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
    [429, 'TOO_MANY_REQUESTS'],
    [500, 'INTERNAL_SERVER_ERROR'],
    [503, 'SERVICE_UNAVAILABLE'],
  ] as const)('maps HTTP %s to default code %s', (status, code) => {
    expect(ResponseHelper.error(status, 'Request failed.', 'trace-2')).toEqual({
      status,
      code,
      message: 'Request failed.',
      data: null,
      traceId: 'trace-2',
    });
  });

  it('preserves a more-specific stable application/domain error code', () => {
    expect(ResponseHelper.error(409, 'Slot unavailable.', 'trace-3', 'BOOKING_SLOT_CONFLICT')).toEqual({
      status: 409,
      code: 'BOOKING_SLOT_CONFLICT',
      message: 'Slot unavailable.',
      data: null,
      traceId: 'trace-3',
    });
  });

  it('keeps the frozen creation contract on HTTP/body status 200', () => {
    expect(ResponseHelper.created({ id: 'new-resource' }, 'Created.', 'trace-4')).toEqual({
      status: 200,
      code: 'SUCCESS',
      message: 'Created.',
      data: { id: 'new-resource' },
      traceId: 'trace-4',
    });
  });

  it('returns no body for the 204 helper contract', () => {
    expect(ResponseHelper.noContent()).toBeUndefined();
  });
});
