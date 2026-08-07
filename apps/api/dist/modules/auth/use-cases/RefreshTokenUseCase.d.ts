import { IUseCase, IUserSessionRepository } from '@carbroz/foundation-kernel';
import { z } from 'zod';
import { RefreshTokenSchema } from '../dtos/auth.dto.js';
type Input = z.infer<typeof RefreshTokenSchema>;
export declare class RefreshTokenUseCase implements IUseCase<Input, any> {
    private readonly userSessionRepository;
    constructor(userSessionRepository: IUserSessionRepository);
    execute(input: Input): Promise<any>;
}
export {};
