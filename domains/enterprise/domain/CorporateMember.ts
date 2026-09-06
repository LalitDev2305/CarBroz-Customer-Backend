import { DomainError } from "@carbroz/foundation-kernel";
/** CorporateMemberRole is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
export type CorporateMemberRole = "CORP_ADMIN" | "FLEET_MANAGER" | "EMPLOYEE";

/** CorporateMemberProps is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** CorporateMember is an exported domains/enterprise contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.corporateAccountId)
      throw new DomainError("Corporate member requires a corporateAccountId");
    if (!props.userId)
      throw new DomainError("Corporate member requires a userId");

    this.id = props.id;
    this.publicId = props.publicId;
    this.corporateAccountId = props.corporateAccountId;
    this.userId = props.userId;
    this.role = props.role ?? "EMPLOYEE";
    this.status = props.status ?? "ACTIVE";
    this.monthlyCapPaise =
      props.monthlyCapPaise != null ? BigInt(props.monthlyCapPaise) : null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  deactivate(): void {
    this.status = "INACTIVE";
  }

  activate(): void {
    this.status = "ACTIVE";
  }
}
