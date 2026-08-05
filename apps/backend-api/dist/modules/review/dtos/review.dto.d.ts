import { z } from 'zod';
export declare const submitReviewSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const moderateReviewSchema: z.ZodObject<{
    reviewPublicId: z.ZodString;
    status: z.ZodEnum<{
        REJECTED: "REJECTED";
        PUBLISHED: "PUBLISHED";
        FLAGGED: "FLAGGED";
    }>;
    moderationReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SubmitReviewDto = z.infer<typeof submitReviewSchema>;
export type ModerateReviewDto = z.infer<typeof moderateReviewSchema>;
