import pino from 'pino';
export declare const createLogger: (name: string, level?: string) => pino.Logger<never, boolean>;
export declare const getFastifyLoggerConfig: (level?: string) => {
    level: string;
    transport: {
        target: string;
        options: {
            colorize: boolean;
            translateTime: string;
            ignore: string;
        };
    } | undefined;
    redact: string[];
};
export declare const logger: pino.Logger<never, boolean>;
