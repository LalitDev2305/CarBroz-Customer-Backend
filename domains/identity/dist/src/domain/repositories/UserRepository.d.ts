import { User } from '../entities/User.js';
export interface UserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
}
