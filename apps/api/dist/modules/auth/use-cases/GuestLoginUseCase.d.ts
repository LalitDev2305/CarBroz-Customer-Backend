import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/foundation-kernel';
import { z } from 'zod';
import { GuestLoginSchema } from '../dtos/auth.dto.js';
type Input = z.infer<typeof GuestLoginSchema>;
export declare class GuestLoginUseCase implements IUseCase<Input, any> {
    private readonly userRepository;
    private readonly userSessionRepository;
    constructor(userRepository: IUserRepository, userSessionRepository: IUserSessionRepository);
    execute(input: Input): Promise<any>;
}
export {};
