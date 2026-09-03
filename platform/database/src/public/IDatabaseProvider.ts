import { type IProvider } from '@carbroz/foundation-kernel';

export interface IDatabaseProvider extends IProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<boolean>;
}
