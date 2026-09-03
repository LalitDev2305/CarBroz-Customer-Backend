export abstract class Entity<TId> {
  protected readonly _id: TId;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: TId, createdAt = new Date(), updatedAt = new Date()) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  equals(other?: Entity<TId>): boolean {
    if (other == null) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}
