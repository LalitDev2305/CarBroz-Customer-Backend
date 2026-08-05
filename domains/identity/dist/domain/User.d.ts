export interface User {
    id: number;
    publicId: string;
    email: string | null;
    phoneNumber: string | null;
    isGuest: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
//# sourceMappingURL=User.d.ts.map