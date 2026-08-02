import { PrismaProvider } from '../providers/PrismaProvider.js';

export class RepositoryFactory {
  private prismaProvider: PrismaProvider;

  constructor(prismaProvider: PrismaProvider) {
    this.prismaProvider = prismaProvider;
  }

  // Repositories will be resolved here dynamically or instantiated when they are implemented
}
