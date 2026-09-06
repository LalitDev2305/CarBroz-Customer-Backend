import { DomainError } from "@carbroz/foundation-kernel";
import { ICorporateAccountRepository } from "../domain/repositories/ICorporateAccountRepository.js";
import { ICorporateFleetVehicleRepository } from "../domain/repositories/ICorporateFleetVehicleRepository.js";
import { AuditLogService } from "@carbroz/domain-audit";
import { RemoveFleetVehicleDto } from "../dtos/corporate.dto.js";

/** RemoveFleetVehicleUseCase is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export class RemoveFleetVehicleUseCase {
  constructor(
    private readonly corporateAccountRepo: ICorporateAccountRepository,
    private readonly fleetVehicleRepo: ICorporateFleetVehicleRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(dto: RemoveFleetVehicleDto, actorUserId: number) {
    const account = await this.corporateAccountRepo.findByPublicId(
      dto.accountPublicId,
    );
    if (!account) {
      throw new DomainError(
        `Corporate account not found with publicId: ${dto.accountPublicId}`,
      );
    }

    const fleetVehicle = await this.fleetVehicleRepo.findByPublicId(
      dto.fleetVehiclePublicId,
    );
    if (!fleetVehicle || fleetVehicle.corporateAccountId !== account.id) {
      throw new DomainError(`Fleet vehicle not found`);
    }

    fleetVehicle.deactivate();
    await this.fleetVehicleRepo.update(fleetVehicle);

    await this.auditLogService.log({
      actorId: actorUserId,
      actorType: "CUSTOMER",
      action: "FLEET_VEHICLE_REMOVE",
      resource: "CorporateFleetVehicle",
      resourcePublicId: fleetVehicle.publicId,
      oldValue: { status: "ACTIVE" },
      newValue: { status: "INACTIVE" },
    });
  }
}
