import { ICorporateAccountRepository, ICorporateFleetVehicleRepository, AuditLogService } from '@carbroz/common';
import { RemoveFleetVehicleDto } from '../dtos/corporate.dto.js';
export declare class RemoveFleetVehicleUseCase {
    private readonly corporateAccountRepo;
    private readonly fleetVehicleRepo;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, fleetVehicleRepo: ICorporateFleetVehicleRepository, auditLogService: AuditLogService);
    execute(dto: RemoveFleetVehicleDto, actorUserId: number): Promise<void>;
}
