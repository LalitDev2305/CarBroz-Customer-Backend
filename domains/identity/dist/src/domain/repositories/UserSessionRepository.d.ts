import { UserSession } from '../entities/UserSession.js';
export interface UserSessionRepository {
    findByToken(token: string): Promise<UserSession | null>;
    create(session: Omit<UserSession, 'id' | 'createdAt'>): Promise<UserSession>;
    invalidate(token: string): Promise<void>;
}
