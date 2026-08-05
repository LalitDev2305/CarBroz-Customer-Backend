export class Entity {
    _id;
    _createdAt;
    _updatedAt;
    constructor(id, createdAt = new Date(), updatedAt = new Date()) {
        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }
    get id() {
        return this._id;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    equals(other) {
        if (other === null || other === undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        return this._id === other._id;
    }
}
//# sourceMappingURL=Entity.js.map