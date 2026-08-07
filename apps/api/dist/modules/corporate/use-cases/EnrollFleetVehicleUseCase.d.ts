import { ICorporateAccountRepository, ICorporateFleetVehicleRepository, IVehicleRepository, AuditLogService } from '@carbroz/foundation-kernel';
import { EnrollFleetVehicleDto } from '../dtos/corporate.dto.js';
export declare class EnrollFleetVehicleUseCase {
    private readonly corporateAccountRepo;
    private readonly fleetVehicleRepo;
    private readonly vehicleRepository;
    private readonly auditLogService;
    constructor(corporateAccountRepo: ICorporateAccountRepository, fleetVehicleRepo: ICorporateFleetVehicleRepository, vehicleRepository: IVehicleRepository, auditLogService: AuditLogService);
    execute(dto: EnrollFleetVehicleDto, actorUserId: number): Promise<any>;
}
