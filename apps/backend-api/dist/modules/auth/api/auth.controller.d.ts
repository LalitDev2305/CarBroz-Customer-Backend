import { FastifyReply, FastifyRequest } from 'fastify';
export declare class AuthController {
    guestLogin(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    sendOtp(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    verifyOtp(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    refresh(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    logout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    logoutAll(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    me(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
