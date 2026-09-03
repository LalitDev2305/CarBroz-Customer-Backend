import { type ICorporateAccountRepository } from '../domain/corporate/repositories/ICorporateAccountRepository.js';
import { type ICorporateFleetVehicleRepository } from '../domain/corporate/repositories/ICorporateFleetVehicleRepository.js';
import { AuditLogService } from '@carbroz/domain-audit';
import { type RemoveFleetVehicleDto } from './contracts/corporate.contracts.js';

export class RemoveFleetVehicleUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly fleetVehicleRepo: ICorporateFleetVehicleRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: RemoveFleetVehicleDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const fleetVehicle = await this.fleetVehicleRepo.findByPublicId(dto.fleetVehiclePublicId);
    if (!fleetVehicle || fleetVehicle.corporateAccountId !== account.id) {
      throw new Error(`Fleet vehicle not found`);
    }

    fleetVehicle.deactivate();
    await this.fleetVehicleRepo.update(fleetVehicle);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: 'CUSTOMER',
      action: 'FLEET_VEHICLE_REMOVE',
      resource: 'CorporateFleetVehicle',
      resourcePublicId: fleetVehicle.publicId,
      oldValue: { status: 'ACTIVE' },
      newValue: { status: 'INACTIVE' },
    });
  }
}
