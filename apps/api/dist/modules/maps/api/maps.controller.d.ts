import { FastifyRequest, FastifyReply } from 'fastify';
export declare class MapsController {
    geocode: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    reverseGeocode: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    calculateDistance: (request: FastifyRequest, reply: FastifyReply) => Promise<never>;
}
