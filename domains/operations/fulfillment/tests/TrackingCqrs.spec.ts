import { describe, it, expect } from 'vitest';
import { StartTrackingSessionCommand, StartTrackingSessionCommandHandler } from '../src/public/index.js';

describe('@carbroz/domain-fulfillment - CQRS Command & Handler', () => {
  it('should instantiate StartTrackingSessionCommand cleanly', () => {
    const cmd = new StartTrackingSessionCommand({ bookingId: 100, partnerId: 50 });
    expect(cmd.props.bookingId).toBe(100);
  });
});
