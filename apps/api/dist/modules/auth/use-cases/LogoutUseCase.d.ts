import { IUseCase, IUserSessionRepository } from '@carbroz/foundation-kernel';
import { z } from 'zod';
import { LogoutSchema } from '../dtos/auth.dto.js';
type Input = z.infer<typeof LogoutSchema> & {
    sessionId?: number;
    userId?: number;
    logoutAll?: boolean;
};
export declare class LogoutUseCase implements IUseCase<Input, void> {
    private readonly userSessionRepository;
    constructor(userSessionRepository: IUserSessionRepository);
    execute(input: Input): Promise<void>;
}
export {};
