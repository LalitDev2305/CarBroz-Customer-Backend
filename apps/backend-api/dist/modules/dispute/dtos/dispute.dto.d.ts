import { z } from 'zod';
export declare const raiseDisputeSchema: z.ZodObject<{
    bookingPublicId: z.ZodString;
    disputeReason: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    requestedRefundPaise: z.ZodNumber;
}, z.core.$strip>;
export declare const resolveDisputeSchema: z.ZodObject<{
    action: z.ZodEnum<{
        REJECT: "REJECT";
        REFUND: "REFUND";
    }>;
    approvedRefundPaise: z.ZodOptional<z.ZodNumber>;
    resolutionNotes: z.ZodString;
}, z.core.$strip>;
