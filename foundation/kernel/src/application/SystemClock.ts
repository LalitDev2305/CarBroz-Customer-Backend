import type { IClockProvider } from './contracts.js';

/** Production wall-clock implementation behind the universal Clock port. */
export class SystemClock implements IClockProvider {
  now(): Date {
    return new Date();
  }
}

/** Shared stateless production Clock implementation. */
export const systemClock: IClockProvider = new SystemClock();
