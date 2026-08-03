import { logger } from '@carbroz/logger';
export class LoggerProvider {
    info(message, context) {
        logger.info(context || {}, message);
    }
    error(message, error, context) {
        logger.error({ ...context, err: error }, message);
    }
    warn(message, context) {
        logger.warn(context || {}, message);
    }
    debug(message, context) {
        logger.debug(context || {}, message);
    }
}
//# sourceMappingURL=LoggerProvider.js.map