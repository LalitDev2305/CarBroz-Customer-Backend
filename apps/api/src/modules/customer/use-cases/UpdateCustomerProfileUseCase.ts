import { IUseCase, IRequestContext, ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';

export interface UpdateCustomerProfileRequest {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  marketingOptIn?: boolean;
}

export class UpdateCustomerProfileUseCase implements IUseCase<{ context: IRequestContext; data: UpdateCustomerProfileRequest }, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: { context: IRequestContext; data: UpdateCustomerProfileRequest }): Promise<CustomerProfile> {
    const user = request.context.authenticatedUser as any;
    if (user?.id !== request.data.userId && !user?.isAdmin) {
      throw new Error('FORBIDDEN: You do not have permission to edit this profile');
    }

    let profile = await this.customerProfileRepository.findByUserId(request.data.userId);
    if (!profile) {
      profile = new CustomerProfile({
        userId: request.data.userId,
      });
    }

    if (request.data.firstName !== undefined) profile.firstName = request.data.firstName;
    if (request.data.lastName !== undefined) profile.lastName = request.data.lastName;
    if (request.data.dateOfBirth !== undefined) profile.dateOfBirth = request.data.dateOfBirth;
    if (request.data.gender !== undefined) profile.gender = request.data.gender;
    if (request.data.marketingOptIn !== undefined) profile.marketingOptIn = request.data.marketingOptIn;

    profile.updatedAt = new Date();
    
    return this.customerProfileRepository.save(profile);
  }
}
