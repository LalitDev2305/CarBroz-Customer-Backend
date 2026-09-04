import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import { ICustomerProfileRepository, CustomerProfile } from '@carbroz/common';

export interface GetCustomerProfileRequest {
  userId: number;
}

export interface GetCustomerProfileInput {
  context: ExecutionContext;
  data: GetCustomerProfileRequest;
}

function canAccessCustomer(context: ExecutionContext, customerId: number): boolean {
  const actor = context.actor;
  if (!actor) return false;
  return actor.kind === 'ADMIN'
    || actor.roles.includes('ADMIN')
    || actor.customerId === customerId
    || String(actor.id) === String(customerId);
}

/** Retrieves (or initializes) the profile owned by the authorized customer actor. */
export class GetCustomerProfileUseCase implements IUseCase<GetCustomerProfileInput, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: GetCustomerProfileInput): Promise<CustomerProfile> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to view this profile');
    }

    let profile = await this.customerProfileRepository.findByUserId(request.data.userId);
    if (!profile) {
      profile = await this.customerProfileRepository.save(
        new CustomerProfile({
          userId: request.data.userId,
          firstName: null,
          lastName: null,
          dateOfBirth: null,
          gender: null,
          marketingOptIn: false,
        }),
      );
    }
    return profile;
  }
}
