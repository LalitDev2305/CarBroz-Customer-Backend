import { IDatabaseProvider } from '../ports/IDatabaseProvider.js';
import { PrismaProvider } from './PrismaProvider.js';

/** PrismaDatabaseProvider is an exported platform/database contract/implementation; see the owning README for lifecycle and extension rules. */
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
