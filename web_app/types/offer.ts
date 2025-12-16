// Offer types
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';
export type QuoteType = 'structured' | 'flexible';
export type RateType = 'hourly' | 'daily' | 'weekly';

export interface Offer {
    id: string;
    taskId: string;
    taskerId: string;
    tasker: {
        id: string;
        name: string;
        avatar?: string;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
        tasksCompleted: number;
    };
    amount: number;
    description: string;
    status: OfferStatus;
    estimatedDuration?: string;
    availability?: string;
    createdAt: string;
    updatedAt: string;
    // New fields for workflow
    acceptedAt?: string;
    declinedAt?: string;
    withdrawnAt?: string;

    // V2 Equipment Quote Fields
    quoteType?: QuoteType;
    rateType?: RateType;
    baseRate?: number;
    deliveryFee?: number;
    operatorFee?: number;
    includesOperator?: boolean;
    inventoryId?: string;
}
