import { Review } from '../entities/Review.js';
export interface ReviewRepository {
    findById(id: number): Promise<Review | null>;
    create(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review>;
    listByPartnerId(partnerId: number, limit?: number, offset?: number): Promise<Review[]>;
}
