import { IProvider } from './IProvider.js';

export interface IDatabaseProvider extends IProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<boolean>;
}
