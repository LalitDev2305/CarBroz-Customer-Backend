import { type IProvider } from './IProvider.js';

export interface IClockProvider extends IProvider {
  getUtcNow(): Date;
}
