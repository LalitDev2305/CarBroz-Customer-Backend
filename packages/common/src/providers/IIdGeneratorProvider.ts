import { IProvider } from './IProvider.js';

export interface IIdGeneratorProvider extends IProvider {
  generateUuidV7(): string;
}
