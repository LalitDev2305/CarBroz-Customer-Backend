import { IDatabaseProvider } from '@carbroz/foundation-kernel';
import { PrismaProvider } from './PrismaProvider.js';

export class PrismaDatabaseProvider implements IDatabaseProvider {
  private prismaProvider: PrismaProvider;

  constructor(prismaProvider: PrismaProvider) {
    this.prismaProvider = prismaProvider;
  }

  public async connect(): Promise<void> {
    await this.prismaProvider.connect();
  }

  public async disconnect(): Promise<void> {
    await this.prismaProvider.disconnect();
  }

  public async health(): Promise<boolean> {
    return this.prismaProvider.health();
  }
}
