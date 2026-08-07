import { IUseCase, IRequestContext, ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';

export interface GetCustomerProfileRequest {
  userId: number;
}

export class GetCustomerProfileUseCase implements IUseCase<{ context: IRequestContext; data: GetCustomerProfileRequest }, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: { context: IRequestContext; data: GetCustomerProfileRequest }): Promise<CustomerProfile> {
    const user = request.context.authenticatedUser as any;
    if (user?.id !== request.data.userId && !user?.isAdmin) {
      throw new Error('FORBIDDEN: You do not have permission to view this profile');
    }

    let profile = await this.customerProfileRepository.findByUserId(request.data.userId);
    if (!profile) {
      // Auto-create empty profile
      profile = await this.customerProfileRepository.save(
        new CustomerProfile({
          userId: request.data.userId,
          firstName: null,
          lastName: null,
          dateOfBirth: null,
          gender: null,
          marketingOptIn: false,
        })
      );
    }
    return profile;
  }
}
