import { Address } from '@carbroz/foundation-kernel';
export class ManageAddressUseCase {
    addressRepository;
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async execute(request) {
        const user = request.context.authenticatedUser;
        if (user?.id !== request.data.userId && !user?.isAdmin) {
            throw new Error('FORBIDDEN: You do not have permission to manage these addresses');
        }
        const { action, userId, addressId, payload } = request.data;
        switch (action) {
            case 'GET_ALL':
                return this.addressRepository.findByUserId(userId);
            case 'GET_DEFAULT':
                return this.addressRepository.findDefaultByUserId(userId);
            case 'ADD': {
                if (!payload)
                    throw new Error('BAD_REQUEST: Payload required for adding address');
                const newAddress = new Address({
                    ...payload,
                    userId,
                });
                return this.addressRepository.save(newAddress);
            }
            case 'UPDATE': {
                if (!addressId)
                    throw new Error('BAD_REQUEST: addressId required for update');
                const existing = await this.addressRepository.findById(addressId);
                if (!existing || existing.userId !== userId)
                    throw new Error('NOT_FOUND: Address not found');
                if (payload?.label !== undefined)
                    existing.label = payload.label;
                if (payload?.addressLine1 !== undefined)
                    existing.addressLine1 = payload.addressLine1;
                if (payload?.addressLine2 !== undefined)
                    existing.addressLine2 = payload.addressLine2;
                if (payload?.city !== undefined)
                    existing.city = payload.city;
                if (payload?.state !== undefined)
                    existing.state = payload.state;
                if (payload?.postalCode !== undefined)
                    existing.postalCode = payload.postalCode;
                if (payload?.country !== undefined)
                    existing.country = payload.country;
                if (payload?.latitude !== undefined)
                    existing.latitude = payload.latitude;
                if (payload?.longitude !== undefined)
                    existing.longitude = payload.longitude;
                if (payload?.isDefault !== undefined)
                    existing.isDefault = payload.isDefault;
                existing.updatedAt = new Date();
                return this.addressRepository.save(existing);
            }
            case 'DELETE': {
                if (!addressId)
                    throw new Error('BAD_REQUEST: addressId required for deletion');
                const toDelete = await this.addressRepository.findById(addressId);
                if (!toDelete || toDelete.userId !== userId)
                    throw new Error('NOT_FOUND: Address not found');
                return this.addressRepository.delete(addressId);
            }
            default:
                throw new Error(`BAD_REQUEST: Unknown action ${action}`);
        }
    }
}
//# sourceMappingURL=ManageAddressUseCase.js.map