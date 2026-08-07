export class CustomerProfile {
    id;
    publicId;
    userId;
    firstName;
    lastName;
    dateOfBirth;
    gender;
    marketingOptIn;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(data) {
        this.id = data.id;
        this.publicId = data.publicId;
        this.userId = data.userId;
        this.firstName = data.firstName ?? null;
        this.lastName = data.lastName ?? null;
        this.dateOfBirth = data.dateOfBirth ?? null;
        this.gender = data.gender ?? null;
        this.marketingOptIn = data.marketingOptIn ?? false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
    }
}
//# sourceMappingURL=CustomerProfile.js.map