import { type ICorporateAccountRepository } from '../domain/corporate/repositories/ICorporateAccountRepository.js';
import { type ICorporateFleetVehicleRepository } from '../domain/corporate/repositories/ICorporateFleetVehicleRepository.js';
import { CorporateFleetVehicle } from '../domain/corporate/CorporateFleetVehicle.js';
import { type IVehicleRepository } from '@carbroz/domain-customer';
import { AuditLogService } from '@carbroz/domain-audit';
import { type EnrollFleetVehicleDto } from './contracts/corporate.contracts.js';

export class EnrollFleetVehicleUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly fleetVehicleRepo: ICorporateFleetVehicleRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(dto: EnrollFleetVehicleDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(dto.accountPublicId);
    if (!account) {
      throw new Error(`Corporate account not found with publicId: ${dto.accountPublicId}`);
    }

    const vehicle = await (this.vehicleRepository as any).findByRegistrationNumber
      ? await (this.vehicleRepository as any).findByRegistrationNumber(dto.registrationNumber)
      : null;

    if (!vehicle) {
      throw new Error(`Vehicle with registration number ${dto.registrationNumber} not found in garage`);
    }

    const existingEnrollment = await this.fleetVehicleRepo.findByAccountAndVehicle(account.id!, vehicle.id!);
    if (existingEnrollment) {
      throw new Error(`Vehicle ${dto.registrationNumber} is already enrolled in this corporate fleet`);
    }

    const fleetVehicle = new CorporateFleetVehicle({
      corporateAccountId: account.id!,
      vehicleId: vehicle.id!,
      department: dto.department,
      costCenter: dto.costCenter,
      monthlyCapPaise: dto.monthlyCapPaise != null ? BigInt(dto.monthlyCapPaise) : null,
      status: 'ACTIVE',
    });

    const savedFleetVehicle = await this.fleetVehicleRepo.create(fleetVehicle);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: 'CUSTOMER',
      action: 'FLEET_VEHICLE_ENROLL',
      resource: 'CorporateFleetVehicle',
      resourcePublicId: savedFleetVehicle.publicId,
      newValue: { corporateAccountId: account.id, vehicleId: vehicle.id, registrationNumber: dto.registrationNumber },
    });

    return savedFleetVehicle;
  }
}
