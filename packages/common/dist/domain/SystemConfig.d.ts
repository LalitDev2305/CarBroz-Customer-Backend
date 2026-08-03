export interface SystemConfig {
    id: number;
    publicId: string;
    key: string;
    value: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
