import { IProvider } from './IProvider.js';
export interface IFeatureFlagProvider extends IProvider {
    isEnabled(key: string): Promise<boolean>;
    getAllFlags(): Promise<Record<string, boolean>>;
}
