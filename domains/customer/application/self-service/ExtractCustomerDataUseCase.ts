import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type ICustomerProfileRepository } from '../../profile/domain/repositories/ICustomerProfileRepository.js';
import { type IAddressRepository } from '../../address/domain/repositories/IAddressRepository.js';

export interface ExtractCustomerDataRequest {
  userId: number;
}

export class ExtractCustomerDataUseCase implements IUseCase<{ context: IRequestContext; data: ExtractCustomerDataRequest }, any> {
  constructor(
    private readonly customerProfileRepository: ICustomerProfileRepository,
    private readonly addressRepository: IAddressRepository
  ) {}

  async execute(request: { context: IRequestContext; data: ExtractCustomerDataRequest }): Promise<any> {
    const user = request.context.authenticatedUser as any;
    if (user?.id !== request.data.userId && !user?.isAdmin) {
      throw new Error('FORBIDDEN: You do not have permission to extract this data');
    }

    const userId = request.data.userId;
    const profile = await this.customerProfileRepository.findByUserId(userId);
    const addresses = await this.addressRepository.findByUserId(userId);

    // Later phases will add bookings, orders, etc.
    return {
      userId,
      extractedAt: new Date().toISOString(),
      profile: profile ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        marketingOptIn: profile.marketingOptIn,
        createdAt: profile.createdAt,
      } : null,
      addresses: addresses.map(addr => ({
        label: addr.label,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt
      }))
    };
  }
}
