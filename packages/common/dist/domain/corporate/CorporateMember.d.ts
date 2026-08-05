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
export declare class CorporateMember {
    id?: number;
    publicId?: string;
    corporateAccountId: number;
    userId: number;
    role: CorporateMemberRole;
    status: string;
    monthlyCapPaise: bigint | null;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: CorporateMemberProps);
    deactivate(): void;
    activate(): void;
}
