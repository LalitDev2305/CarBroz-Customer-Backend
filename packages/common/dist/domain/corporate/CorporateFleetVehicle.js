export class CorporateFleetVehicle {
    id;
    publicId;
    corporateAccountId;
    vehicleId;
    department;
    costCenter;
    monthlyCapPaise;
    status;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.corporateAccountId)
            throw new Error('Fleet vehicle requires a corporateAccountId');
        if (!props.vehicleId)
            throw new Error('Fleet vehicle requires a vehicleId');
        this.id = props.id;
        this.publicId = props.publicId;
        this.corporateAccountId = props.corporateAccountId;
        this.vehicleId = props.vehicleId;
        this.department = props.department ?? null;
        this.costCenter = props.costCenter ?? null;
        this.monthlyCapPaise = props.monthlyCapPaise != null ? BigInt(props.monthlyCapPaise) : null;
        this.status = props.status ?? 'ACTIVE';
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
//# sourceMappingURL=CorporateFleetVehicle.js.map