import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/common';
import { z } from 'zod';
import { VerifyOtpSchema } from '../dtos/auth.dto.js';
type Input = z.infer<typeof VerifyOtpSchema>;
export declare class VerifyOtpUseCase implements IUseCase<Input, any> {
    private readonly userRepository;
    private readonly userSessionRepository;
    constructor(userRepository: IUserRepository, userSessionRepository: IUserSessionRepository);
    execute(input: Input): Promise<any>;
}
export {};
