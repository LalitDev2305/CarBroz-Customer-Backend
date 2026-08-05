export class CorporateMember {
    id;
    publicId;
    corporateAccountId;
    userId;
    role;
    status;
    monthlyCapPaise;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.corporateAccountId)
            throw new Error('Corporate member requires a corporateAccountId');
        if (!props.userId)
            throw new Error('Corporate member requires a userId');
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
    deactivate() {
        this.status = 'INACTIVE';
    }
    activate() {
        this.status = 'ACTIVE';
    }
}
//# sourceMappingURL=CorporateMember.js.map