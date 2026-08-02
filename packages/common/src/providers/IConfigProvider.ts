import { IProvider } from './IProvider.js';

export interface IConfigProvider extends IProvider {
  get<T>(key: string): T;
  has(key: string): boolean;
}
