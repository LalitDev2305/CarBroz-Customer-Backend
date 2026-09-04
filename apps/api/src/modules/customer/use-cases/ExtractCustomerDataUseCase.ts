import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import { ICustomerProfileRepository, IAddressRepository } from '@carbroz/common';

export interface ExtractCustomerDataRequest {
  userId: number;
}

export interface ExtractCustomerDataInput {
  context: ExecutionContext;
  data: ExtractCustomerDataRequest;
}

export interface ExtractedCustomerData {
  userId: number;
  extractedAt: string;
  profile: Record<string, unknown> | null;
  addresses: Array<Record<string, unknown>>;
}

function canAccessCustomer(context: ExecutionContext, customerId: number): boolean {
  const actor = context.actor;
  if (!actor) return false;
  return actor.kind === 'ADMIN'
    || actor.roles.includes('ADMIN')
    || actor.customerId === customerId
    || String(actor.id) === String(customerId);
}

/** Collects the Customer-owned data set available in the current bounded context. */
export class ExtractCustomerDataUseCase implements IUseCase<ExtractCustomerDataInput, ExtractedCustomerData> {
  constructor(
    private readonly customerProfileRepository: ICustomerProfileRepository,
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(request: ExtractCustomerDataInput): Promise<ExtractedCustomerData> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to extract this data');
    }

    const userId = request.data.userId;
    const profile = await this.customerProfileRepository.findByUserId(userId);
    const addresses = await this.addressRepository.findByUserId(userId);

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
      addresses: addresses.map((address) => ({
        label: address.label,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
      })),
    };
  }
}
