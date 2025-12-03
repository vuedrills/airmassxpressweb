// Dummy profile data for public profiles

export interface Review {
    id: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    comment: string;
    taskDescription: string;
    timeAgo: string;
}

export interface ProfileData {
    userId: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastOnline: string;
    location: string;
    overallRating: number;
    reviewCount: number;
    completionRate: number;
    completedTasksCount: number;
    isIdVerified: boolean;
    education: string[];
    reviews: Review[];
    categoryRatings?: {
        communication: number;
        punctuality: number;
        eyeForDetail: number;
        efficiency: number;
    };
}

export const profilesData: Record<string, ProfileData> = {
    'user-1': {
        userId: 'user-1',
        name: 'Tendai Moyo',
        avatar: '/avatars/91.jpg',
        isOnline: true,
        lastOnline: '1 day ago',
        location: 'Harare, Zimbabwe',
        overallRating: 4.9,
        reviewCount: 127,
        completionRate: 95,
        completedTasksCount: 145,
        isIdVerified: true,
        education: ['Business administration', 'Plumbing certification'],
        categoryRatings: {
            communication: 4.9,
            punctuality: 4.7,
            eyeForDetail: 4.6,
            efficiency: 4.9,
        },
        reviews: [
            {
                id: 'review-1',
                reviewerName: 'Chipo Dube',
                reviewerAvatar: '/avatars/63.jpg',
                rating: 5,
                comment: 'Thank you for the excellent work. I will get in touch with you later regarding similar tasks.',
                taskDescription: 'Emergency plumbing repair',
                timeAgo: '9 months ago',
            },
            {
                id: 'review-2',
                reviewerName: 'Takudzwa Ncube',
                reviewerAvatar: '/avatars/19.jpg',
                rating: 5,
                comment: 'Very thorough and efficient tasker. I would highly recommend. Thanks Tendai.',
                taskDescription: 'Fix burst water pipe',
                timeAgo: '1 year ago',
            },
            {
                id: 'review-3',
                reviewerName: 'Ruva Nyathi',
                reviewerAvatar: '/avatars/84.jpg',
                rating: 5,
                comment: 'Pleasure dealing with Tendai, good communication, very helpful person, highly recommended.',
                taskDescription: 'Bathroom sink installation',
                timeAgo: '1 year ago',
            },
        ],
    },
    'user-2': {
        userId: 'user-2',
        name: 'Rudo Chikwava',
        avatar: '/avatars/63.jpg',
        isOnline: false,
        lastOnline: '3 hours ago',
        location: 'Bulawayo, Zimbabwe',
        overallRating: 4.7,
        reviewCount: 89,
        completionRate: 92,
        completedTasksCount: 103,
        isIdVerified: true,
        education: ['Electrical engineering', 'English'],
        categoryRatings: {
            communication: 4.8,
            punctuality: 4.6,
            eyeForDetail: 4.7,
            efficiency: 4.7,
        },
        reviews: [
            {
                id: 'review-4',
                reviewerName: 'Tatenda Sibanda',
                reviewerAvatar: '/avatars/91.jpg',
                rating: 5,
                comment: 'Very professional and knowledgeable. Fixed the wiring issues quickly.',
                taskDescription: 'Electrical rewiring',
                timeAgo: '2 months ago',
            },
            {
                id: 'review-5',
                reviewerName: 'Ngoni Mahlangu',
                reviewerAvatar: '/avatars/19.jpg',
                rating: 4,
                comment: 'Good work, arrived on time and completed the task efficiently.',
                taskDescription: 'Install ceiling lights',
                timeAgo: '5 months ago',
            },
        ],
    },
    'user-3': {
        userId: 'user-3',
        name: 'Panashe Mpofu',
        avatar: '/avatars/19.jpg',
        isOnline: true,
        lastOnline: 'Online now',
        location: 'Chitungwiza, Zimbabwe',
        overallRating: 4.8,
        reviewCount: 54,
        completionRate: 88,
        completedTasksCount: 67,
        isIdVerified: false,
        education: ['Carpentry', 'Construction management'],
        reviews: [
            {
                id: 'review-6',
                reviewerName: 'Chenai Dlamini',
                reviewerAvatar: '/avatars/84.jpg',
                rating: 5,
                comment: 'Excellent carpentry work! Very satisfied with the custom shelves.',
                taskDescription: 'Build custom shelving units',
                timeAgo: '1 month ago',
            },
        ],
    },
};

export function getProfileData(userId: string): ProfileData | null {
    return profilesData[userId] || null;
}
