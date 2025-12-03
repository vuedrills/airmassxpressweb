// Task types
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type DateType = 'on_date' | 'before_date' | 'flexible';
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'evening';

export interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    location: string;
    dateType: DateType;
    date?: string;
    timeOfDay?: TimeOfDay;
    status: TaskStatus;
    posterId: string;
    poster?: {
        id: string;
        name: string;
        avatar?: string;
        rating: number;
        reviewCount: number;
        isVerified: boolean;
    };
    offerCount: number;
    images?: string[];
    createdAt: string;
    updatedAt: string;
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
