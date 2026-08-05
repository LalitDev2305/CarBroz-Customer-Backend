import FastifyPlugin from 'fastify-plugin';
import FastifyHelmet from '@fastify/helmet';
import FastifyRateLimit from '@fastify/rate-limit';
export const securityPlugin = FastifyPlugin(async (fastify) => {
    // Security Headers via Helmet
    await fastify.register(FastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xContentTypeOptions: true,
        xDnsPrefetchControl: { allow: false },
        xFrameOptions: { action: 'deny' },
        xXssProtection: true,
    });
    // Global Rate Limiting
    await fastify.register(FastifyRateLimit, {
        global: true,
        max: 100, // Default 100 requests per minute for public APIs
        timeWindow: '1 minute',
        keyGenerator: (req) => {
            return req.headers['x-forwarded-for'] || req.ip;
        },
        allowList: (req) => {
            // Exempt Webhook signature-protected endpoints from IP rate limits
            return req.url.startsWith('/api/v1/payments/webhook');
        },
        errorResponseBuilder: () => {
            return {
                success: false,
                statusCode: 429,
                errorCode: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                timestamp: new Date().toISOString(),
            };
        },
    });
});
//# sourceMappingURL=security.plugin.js.map