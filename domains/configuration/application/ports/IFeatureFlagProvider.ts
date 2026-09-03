import { type IProvider } from '@carbroz/foundation-kernel';

export interface IFeatureFlagProvider extends IProvider {
  isEnabled(key: string): Promise<boolean>;
  getAllFlags(): Promise<Record<string, boolean>>;
}
