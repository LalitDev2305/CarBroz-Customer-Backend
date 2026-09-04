import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import { IAddressRepository, Address } from '@carbroz/common';

export type AddressAction = 'ADD' | 'UPDATE' | 'DELETE' | 'GET_ALL' | 'GET_DEFAULT';

export interface ManageAddressRequest {
  userId: number;
  action: AddressAction;
  addressId?: number;
  payload?: Partial<Address>;
}

export interface ManageAddressInput {
  context: ExecutionContext;
  data: ManageAddressRequest;
}

type ManageAddressResult = Address | Address[] | null | boolean;

function canAccessCustomer(context: ExecutionContext, customerId: number): boolean {
  const actor = context.actor;
  if (!actor) return false;
  return actor.kind === 'ADMIN'
    || actor.roles.includes('ADMIN')
    || actor.customerId === customerId
    || String(actor.id) === String(customerId);
}

/**
 * Orchestrates Customer-owned address queries and mutations for an authorized actor.
 *
 * Transport authentication is adapted into ExecutionContext before this use case is called.
 * Persistence is accessed only through IAddressRepository; HTTP/Fastify and Prisma types are
 * forbidden from this application service.
 */
export class ManageAddressUseCase implements IUseCase<ManageAddressInput, ManageAddressResult> {
  constructor(private readonly addressRepository: IAddressRepository) {}

  async execute(request: ManageAddressInput): Promise<ManageAddressResult> {
    if (!canAccessCustomer(request.context, request.data.userId)) {
      throw new Error('FORBIDDEN: You do not have permission to manage these addresses');
    }

    const { action, userId, addressId, payload } = request.data;

    switch (action) {
      case 'GET_ALL':
        return this.addressRepository.findByUserId(userId);

      case 'GET_DEFAULT':
        return this.addressRepository.findDefaultByUserId(userId);

      case 'ADD': {
        if (!payload) throw new Error('BAD_REQUEST: Payload required for adding address');
        return this.addressRepository.save(new Address({ ...payload, userId }));
      }

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
        const toDelete = await this.addressRepository.findById(addressId);
        if (!toDelete || toDelete.userId !== userId) throw new Error('NOT_FOUND: Address not found');
        return this.addressRepository.delete(addressId);
      }

      default:
        throw new Error(`BAD_REQUEST: Unknown action ${String(action)}`);
    }
  }
}
