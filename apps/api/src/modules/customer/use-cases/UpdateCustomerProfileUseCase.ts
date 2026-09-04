import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import { ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';

export interface UpdateCustomerProfileRequest {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  marketingOptIn?: boolean;
}

export interface UpdateCustomerProfileInput {
  context: ExecutionContext;
  data: UpdateCustomerProfileRequest;
}

function canAccessCustomer(context: ExecutionContext, customerId: number): boolean {
  const actor = context.actor;
  if (!actor) return false;
  return actor.kind === 'ADMIN'
    || actor.roles.includes('ADMIN')
    || actor.customerId === customerId
    || String(actor.id) === String(customerId);
}

/** Updates only Customer-owned profile fields for an authorized actor. */
export class UpdateCustomerProfileUseCase implements IUseCase<UpdateCustomerProfileInput, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: UpdateCustomerProfileInput): Promise<CustomerProfile> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to edit this profile');
    }

    let profile = await this.customerProfileRepository.findByUserId(request.data.userId);
    if (!profile) profile = new CustomerProfile({ userId: request.data.userId });

    if (request.data.firstName !== undefined) profile.firstName = request.data.firstName;
    if (request.data.lastName !== undefined) profile.lastName = request.data.lastName;
    if (request.data.dateOfBirth !== undefined) profile.dateOfBirth = request.data.dateOfBirth;
    if (request.data.gender !== undefined) profile.gender = request.data.gender;
    if (request.data.marketingOptIn !== undefined) profile.marketingOptIn = request.data.marketingOptIn;

    profile.updatedAt = new Date();
    return this.customerProfileRepository.save(profile);
  }
}
