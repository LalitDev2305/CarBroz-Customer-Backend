export type CorporateMemberRole = 'CORP_ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE';

export interface CorporateMemberProps {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  userId: number;
  role?: CorporateMemberRole;
  status?: string;
  monthlyCapPaise?: bigint | number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CorporateMember {
  id?: number;
  publicId?: string;
  corporateAccountId: number;
  userId: number;
  role: CorporateMemberRole;
  status: string;
  monthlyCapPaise: bigint | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: CorporateMemberProps) {
    if (!props.corporateAccountId) throw new Error('Corporate member requires a corporateAccountId');
    if (!props.userId) throw new Error('Corporate member requires a userId');

    this.id = props.id;
    this.publicId = props.publicId;
    this.corporateAccountId = props.corporateAccountId;
    this.userId = props.userId;
    this.role = props.role ?? 'EMPLOYEE';
    this.status = props.status ?? 'ACTIVE';
    this.monthlyCapPaise = props.monthlyCapPaise != null ? BigInt(props.monthlyCapPaise) : null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  deactivate(): void {
    this.status = 'INACTIVE';
  }

  activate(): void {
    this.status = 'ACTIVE';
  }
}
