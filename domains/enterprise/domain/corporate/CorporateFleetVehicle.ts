export interface CorporateFleetVehicleProps {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  vehicleId: number;
  department?: string | null;
  costCenter?: string | null;
  monthlyCapPaise?: bigint | number | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CorporateFleetVehicle {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  vehicleId: number;
  department: string | null;
  costCenter: string | null;
  monthlyCapPaise: bigint | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: CorporateFleetVehicleProps) {
    if (!props.corporateAccountId) throw new Error('Fleet vehicle requires a corporateAccountId');
    if (!props.vehicleId) throw new Error('Fleet vehicle requires a vehicleId');

    if (props.id !== undefined) this.id = props.id;
    if (props.publicId !== undefined) this.publicId = props.publicId;
    this.corporateAccountId = props.corporateAccountId;
    this.vehicleId = props.vehicleId;
    this.department = props.department ?? null;
    this.costCenter = props.costCenter ?? null;
    this.monthlyCapPaise = props.monthlyCapPaise != null ? BigInt(props.monthlyCapPaise) : null;
    this.status = props.status ?? 'ACTIVE';
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
    if (props.updatedAt !== undefined) this.updatedAt = props.updatedAt;
  }

  deactivate(): void {
    this.status = 'INACTIVE';
  }

  activate(): void {
    this.status = 'ACTIVE';
  }
}
