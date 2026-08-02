import { IUseCase, IUserRepository } from '@carbroz/common';
import { z } from 'zod';
import { SendOtpSchema } from '../dtos/auth.dto.js';
type Input = z.infer<typeof SendOtpSchema>;
export declare class SendOtpUseCase implements IUseCase<Input, any> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(input: Input): Promise<any>;
}
export {};
