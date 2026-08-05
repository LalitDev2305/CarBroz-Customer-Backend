export declare abstract class Entity<TId> {
    protected readonly _id: TId;
    protected readonly _createdAt: Date;
    protected _updatedAt: Date;
    constructor(id: TId, createdAt?: Date, updatedAt?: Date);
    get id(): TId;
    get createdAt(): Date;
    get updatedAt(): Date;
    equals(other?: Entity<TId>): boolean;
}
//# sourceMappingURL=Entity.d.ts.map