export interface Qualification {
    name: string;
    issuer: string;
    date: string;
    url: string;
}

export interface DaySchedule {
    day: string;
    isAvailable: boolean;
    timeRanges: string[]; // ["09:00-17:00"]
}

export interface Availability {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
}

export interface TaskerProfile {
    status: 'not_started' | 'in_progress' | 'pending_review' | 'approved';
    onboardingStep: number;
    professionIds?: string[];
    bio?: string;
    profilePictureUrl?: string;
    idDocumentUrls?: string[];
    selfieUrl?: string;
    addressDocumentUrl?: string;
    portfolioUrls?: string[];
    qualifications?: Qualification[];
    availability?: Availability;
    ecocashNumber?: string;
}

export interface Profession {
    id: string;
    name: string;
    categoryId: string;
}

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    tasksCompleted: number;
    memberSince: string;
    lastActivityAt?: string;
    skills?: string[];
    badges?: Badge[];
    // Tasker specific
    isTasker?: boolean;
    role?: string;
    taskerProfile?: TaskerProfile;
    // Loaded relationships
    reviews_received?: any[]; // Using any[] for now to match direct backend response, ideally mapped to Review[]
}

export interface UserStats {
    tasksPosted: number;
    tasksCompleted: number;
    offersReceived: number;
    averageRating: number;
    totalEarnings: number;
}

export interface Review {
    id: string;
    taskId: string;
    reviewerId: string;
    reviewer: User;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedAt: string;
}

