// Task types
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'revision_requested' | 'dispute';
export type DateType = 'on_date' | 'before_date' | 'flexible';
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';
export type HireDurationType = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type OperatorPreference = 'required' | 'preferred' | 'not_needed';

export interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    location: string;
    lat?: number;
    lng?: number;
    dateType: DateType;
    date?: string;
    timeOfDay?: TimeOfDay;
    status: TaskStatus;
    taskType?: 'service' | 'equipment';
    posterId: string;
    poster?: {
        id: string;
        name: string;
        avatar?: string;
        avatar_url?: string;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
    };
    offerCount: number;
    attachments?: { id: string; url: string; type: 'image' | 'document'; name: string }[];
    images?: string[]; // Kept for backward compatibility
    createdAt: string;
    updatedAt: string;
    // New fields for workflow
    acceptedOfferId?: string;
    progress?: number; // 0-100
    cancelledBy?: 'poster' | 'tasker';
    cancellationReason?: string;
    revisionMessage?: string;
    completedAt?: string;
    // Relations
    conversationId?: string;
    acceptedOffer?: {
        id: string;
        taskerId: string;
        amount: number;
        conversationId?: string;
    };

    // V2 Equipment Fields
    hireDurationType?: HireDurationType;
    estimatedHours?: number;
    estimatedDuration?: number; // Generic count for days/weeks/months
    fuelIncluded?: boolean;
    operatorPreference?: OperatorPreference;
    requiredCapacityId?: string;

    // Location V2
    city?: string;
    suburb?: string;
    addressDetails?: string;
    locationConfSource?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description?: string;
    taskCount?: number;
}

export interface Question {
    id: string;
    taskId: string;
    userId: string;
    user: {
        name: string;
        avatar?: string;
    };
    question: string;
    answer?: string;
    createdAt: string;
}
