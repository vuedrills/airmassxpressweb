// Offer types
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

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
}
