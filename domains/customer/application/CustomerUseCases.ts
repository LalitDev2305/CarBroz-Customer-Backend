import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import { Address } from '../address/domain/Address.js';
import type { IAddressRepository } from '../address/domain/repositories/IAddressRepository.js';
import { CustomerProfile } from '../profile/domain/CustomerProfile.js';
import type { ICustomerProfileRepository } from '../profile/domain/repositories/ICustomerProfileRepository.js';

function canAccessCustomer(context: ExecutionContext, customerId: number): boolean {
  const actor = context.actor;
  if (!actor) return false;
  return actor.kind === 'ADMIN'
    || actor.roles.includes('ADMIN')
    || actor.customerId === customerId
    || String(actor.id) === String(customerId);
}

export interface GetCustomerProfileRequest { userId: number; }
export interface GetCustomerProfileInput { context: ExecutionContext; data: GetCustomerProfileRequest; }

/** Retrieves or initializes a Customer-owned profile for an authorized actor. */
export class GetCustomerProfileUseCase implements IUseCase<GetCustomerProfileInput, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: GetCustomerProfileInput): Promise<CustomerProfile> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to view this profile');
    }
    const existing = await this.customerProfileRepository.findByUserId(request.data.userId);
    if (existing) return existing;
    return this.customerProfileRepository.save(new CustomerProfile({
      userId: request.data.userId,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      gender: null,
      marketingOptIn: false,
    }));
  }
}

export interface UpdateCustomerProfileRequest {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  marketingOptIn?: boolean;
}
export interface UpdateCustomerProfileInput { context: ExecutionContext; data: UpdateCustomerProfileRequest; }

/** Updates Customer-owned profile fields for an authorized actor. */
export class UpdateCustomerProfileUseCase implements IUseCase<UpdateCustomerProfileInput, CustomerProfile> {
  constructor(private readonly customerProfileRepository: ICustomerProfileRepository) {}

  async execute(request: UpdateCustomerProfileInput): Promise<CustomerProfile> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to edit this profile');
    }
    const profile = (await this.customerProfileRepository.findByUserId(request.data.userId))
      ?? new CustomerProfile({ userId: request.data.userId });
    if (request.data.firstName !== undefined) profile.firstName = request.data.firstName;
    if (request.data.lastName !== undefined) profile.lastName = request.data.lastName;
    if (request.data.dateOfBirth !== undefined) profile.dateOfBirth = request.data.dateOfBirth;
    if (request.data.gender !== undefined) profile.gender = request.data.gender;
    if (request.data.marketingOptIn !== undefined) profile.marketingOptIn = request.data.marketingOptIn;
    profile.updatedAt = new Date();
    return this.customerProfileRepository.save(profile);
  }
}

export type AddressAction = 'ADD' | 'UPDATE' | 'DELETE' | 'GET_ALL' | 'GET_DEFAULT';
export interface ManageAddressRequest {
  userId: number;
  action: AddressAction;
  addressId?: number;
  payload?: Partial<Address>;
}
export interface ManageAddressInput { context: ExecutionContext; data: ManageAddressRequest; }
export type ManageAddressResult = Address | Address[] | null | boolean;

/** Orchestrates Customer-owned address queries and mutations through the repository port. */
export class ManageAddressUseCase implements IUseCase<ManageAddressInput, ManageAddressResult> {
  constructor(private readonly addressRepository: IAddressRepository) {}

  async execute(request: ManageAddressInput): Promise<ManageAddressResult> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to manage these addresses');
    }
    const { action, userId, addressId, payload } = request.data;
    switch (action) {
      case 'GET_ALL': return this.addressRepository.findByUserId(userId);
      case 'GET_DEFAULT': return this.addressRepository.findDefaultByUserId(userId);
      case 'ADD':
        if (!payload) throw new Error('BAD_REQUEST: Payload required for adding address');
        return this.addressRepository.save(new Address({ ...payload, userId }));
      case 'UPDATE': {
        if (!addressId) throw new Error('BAD_REQUEST: addressId required for update');
        const existing = await this.addressRepository.findById(addressId);
        if (!existing || existing.userId !== userId) throw new Error('NOT_FOUND: Address not found');
        if (payload?.label !== undefined) existing.label = payload.label;
        if (payload?.addressLine1 !== undefined) existing.addressLine1 = payload.addressLine1;
        if (payload?.addressLine2 !== undefined) existing.addressLine2 = payload.addressLine2;
        if (payload?.city !== undefined) existing.city = payload.city;
        if (payload?.state !== undefined) existing.state = payload.state;
        if (payload?.postalCode !== undefined) existing.postalCode = payload.postalCode;
        if (payload?.country !== undefined) existing.country = payload.country;
        if (payload?.latitude !== undefined) existing.latitude = payload.latitude;
        if (payload?.longitude !== undefined) existing.longitude = payload.longitude;
        if (payload?.isDefault !== undefined) existing.isDefault = payload.isDefault;
        existing.updatedAt = new Date();
        return this.addressRepository.save(existing);
      }
      case 'DELETE': {
        if (!addressId) throw new Error('BAD_REQUEST: addressId required for deletion');
        const existing = await this.addressRepository.findById(addressId);
        if (!existing || existing.userId !== userId) throw new Error('NOT_FOUND: Address not found');
        return this.addressRepository.delete(addressId);
      }
      default: throw new Error(`BAD_REQUEST: Unknown action ${String(action)}`);
    }
  }
}

export interface ExtractCustomerDataRequest { userId: number; }
export interface ExtractCustomerDataInput { context: ExecutionContext; data: ExtractCustomerDataRequest; }
export interface ExtractedCustomerData {
  userId: number;
  extractedAt: string;
  profile: Record<string, unknown> | null;
  addresses: Array<Record<string, unknown>>;
}

/** Collects the Customer-owned data set available in this bounded context. */
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
