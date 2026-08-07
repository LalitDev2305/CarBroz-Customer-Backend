export interface IDatabaseProvider {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    health?(): Promise<boolean>;
    healthCheck?(): Promise<boolean>;
    getClient?(): any;
}
export interface ITransactionProvider {
    runInTransaction<T>(work: (tx: any) => Promise<T>): Promise<T>;
}
export interface ILoggerProvider {
    info(message: string, context?: Record<string, any>): void;
    error(message: string, error?: any, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
}
export interface IConfigProvider {
    get<T = any>(key: string, defaultValue?: T): Promise<T>;
    has(key: string): Promise<boolean>;
}
export interface IConfigRepository {
    findByKey(key: string): Promise<{
        key: string;
        value: any;
    } | null>;
    findAll(): Promise<Array<{
        key: string;
        value: any;
    }>>;
}
export interface IFeatureFlagProvider {
    isEnabled(key: string): Promise<boolean>;
    getAllFlags(): Promise<Record<string, boolean>>;
}
export interface IFeatureFlagRepository {
    findByKey(key: string): Promise<{
        key: string;
        enabled: boolean;
    } | null>;
    findAllFlags(): Promise<Array<{
        key: string;
        enabled: boolean;
    }>>;
}
export interface IStorageProvider {
    uploadFile(bucket: string, path: string, content: Uint8Array, mimeType?: string): Promise<string>;
    getFileUrl(bucket: string, path: string): Promise<string>;
    deleteFile?(bucket: string, path: string): Promise<void>;
}
export interface NotificationPayload {
    channel: 'PUSH' | 'SMS' | 'EMAIL';
    recipient: string;
    title?: string;
    body: string;
    data?: Record<string, any>;
    templateId?: string;
}
export interface NotificationDispatchResult {
    success: boolean;
    messageId?: string;
    provider?: string;
    providerReference?: string;
    successCount?: number;
    failureCount?: number;
    errorCode?: string;
    errorMessage?: string;
}
export interface IPushProvider {
    sendPush(payload: any): Promise<any>;
}
export interface ISmsProvider {
    sendSms(payload: any): Promise<any>;
}
export interface IEmailProvider {
    sendEmail(payload: any): Promise<any>;
}
export interface INotificationProvider {
    dispatch(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
