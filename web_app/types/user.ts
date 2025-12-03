// User types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    tasksCompleted: number;
    memberSince: string;
    skills?: string[];
    badges?: Badge[];
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
