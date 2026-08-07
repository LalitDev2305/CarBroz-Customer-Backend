export interface Permission {
    id: number;
    publicId: string;
    key: string;
    module: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
