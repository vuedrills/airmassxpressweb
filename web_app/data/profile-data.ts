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
                reviewerAvatar: '/avatars/54.jpg',
                rating: 5,
                comment: 'Very thorough and efficient tasker. I would highly recommend. Thanks Tendai.',
                taskDescription: 'Fix burst water pipe',
                timeAgo: '1 year ago',
            },
            {
                id: 'review-3',
                reviewerName: 'Ruva Nyathi',
                reviewerAvatar: '/avatars/80.jpg',
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
                reviewerAvatar: '/avatars/54.jpg',
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
        avatar: '/avatars/80.jpg',
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
                reviewerAvatar: '/avatars/80.jpg',
                rating: 5,
                comment: 'Excellent carpentry work! Very satisfied with the custom shelves.',
                taskDescription: 'Build custom shelving units',
                timeAgo: '1 month ago',
            },
        ],
    },
    'user-4': {
        userId: 'user-4',
        name: 'Chipo Khumalo',
        avatar: '/avatars/female62.jpg',
        isOnline: false,
        lastOnline: '2 hours ago',
        location: 'Mount Pleasant, Harare',
        overallRating: 4.8,
        reviewCount: 73,
        completionRate: 89,
        completedTasksCount: 81,
        isIdVerified: true,
        education: ['Landscape design', 'Horticulture'],
        reviews: [
            {
                id: 'review-7',
                reviewerName: 'Tapiwa Nyathi',
                reviewerAvatar: '/avatars/63.jpg',
                rating: 5,
                comment: 'Beautiful garden transformation! Very professional and creative.',
                taskDescription: 'Garden design and landscaping',
                timeAgo: '2 weeks ago',
            },
        ],
    },
    'user-5': {
        userId: 'user-5',
        name: 'Tapiwa Nyathi',
        avatar: '/avatars/63.jpg',
        isOnline: true,
        lastOnline: 'Online now',
        location: 'Greendale, Harare',
        overallRating: 4.9,
        reviewCount: 112,
        completionRate: 93,
        completedTasksCount: 134,
        isIdVerified: true,
        education: ['Carpentry', 'Woodworking'],
        categoryRatings: {
            communication: 4.8,
            punctuality: 4.9,
            eyeForDetail: 5.0,
            efficiency: 4.8,
        },
        reviews: [
            {
                id: 'review-10',
                reviewerName: 'Chipo Khumalo',
                reviewerAvatar: '/avatars/female62.jpg',
                rating: 5,
                comment: 'Beautiful custom furniture! Exceeded my expectations. Very skilled craftsman.',
                taskDescription: 'Custom dining table and chairs',
                timeAgo: '2 months ago',
            },
            {
                id: 'review-11',
                reviewerName: 'Munashe Sibanda',
                reviewerAvatar: '/avatars/female92.jpg',
                rating: 5,
                comment: 'Professional work on kitchen cabinets. Great attention to detail.',
                taskDescription: 'Kitchen cabinet installation',
                timeAgo: '4 months ago',
            },
        ],
    },
    'user-6': {
        userId: 'user-6',
        name: 'Nyasha Dube',
        avatar: '/avatars/female89.jpg',
        isOnline: false,
        lastOnline: '1 hour ago',
        location: 'Mutare',
        overallRating: 4.6,
        reviewCount: 45,
        completionRate: 87,
        completedTasksCount: 52,
        isIdVerified: true,
        education: ['Painting and decorating', 'Color theory'],
        reviews: [
            {
                id: 'review-12',
                reviewerName: 'Rufaro Ndlovu',
                reviewerAvatar: '/avatars/female16.jpg',
                rating: 5,
                comment: 'Helped me choose perfect colors and the finish is flawless. Very professional!',
                taskDescription: 'House interior painting',
                timeAgo: '3 weeks ago',
            },
            {
                id: 'review-13',
                reviewerName: 'Tendai Moyo',
                reviewerAvatar: '/avatars/91.jpg',
                rating: 4,
                comment: 'Good work overall. Some minor touch-ups needed but satisfied with the result.',
                taskDescription: 'Office painting',
                timeAgo: '2 months ago',
            },
        ],
    },
    'user-7': {
        userId: 'user-7',
        name: 'Farai Chikwanha',
        avatar: '/avatars/17.jpg',
        isOnline: true,
        lastOnline: 'Online now',
        location: 'Highlands, Harare',
        overallRating: 5.0,
        reviewCount: 98,
        completionRate: 96,
        completedTasksCount: 102,
        isIdVerified: true,
        education: ['Plumbing certification', 'Building services'],
        categoryRatings: {
            communication: 5.0,
            punctuality: 4.9,
            eyeForDetail: 4.9,
            efficiency: 5.0,
        },
        reviews: [
            {
                id: 'review-14',
                reviewerName: 'Simba Mhango',
                reviewerAvatar: '/avatars/80.jpg',
                rating: 5,
                comment: 'Responded to emergency call immediately. Fixed bathroom leak perfectly. Highly recommend!',
                taskDescription: 'Emergency plumbing repair',
                timeAgo: '1 week ago',
            },
            {
                id: 'review-15',
                reviewerName: 'Chipo Khumalo',
                reviewerAvatar: '/avatars/female62.jpg',
                rating: 5,
                comment: 'Installed new water heater efficiently. Very clean work and explained everything clearly.',
                taskDescription: 'Water heater installation',
                timeAgo: '1 month ago',
            },
        ],
    },
    'user-8': {
        userId: 'user-8',
        name: 'Munashe Sibanda',
        avatar: '/avatars/female92.jpg',
        isOnline: true,
        lastOnline: 'Online now',
        location: 'Gweru',
        overallRating: 4.9,
        reviewCount: 67,
        completionRate: 94,
        completedTasksCount: 71,
        isIdVerified: true,
        education: ['Electrical engineering', 'Solar installation certification'],
        categoryRatings: {
            communication: 4.9,
            punctuality: 4.8,
            eyeForDetail: 4.9,
            efficiency: 4.9,
        },
        reviews: [
            {
                id: 'review-8',
                reviewerName: 'Rudo Chihota',
                reviewerAvatar: '/avatars/53.jpg',
                rating: 5,
                comment: 'Excellent work on the solar installation. Very knowledgeable and professional.',
                taskDescription: '5kW Solar system installation',
                timeAgo: '3 weeks ago',
            },
            {
                id: 'review-9',
                reviewerName: 'Farai Chikwanha',
                reviewerAvatar: '/avatars/17.jpg',
                rating: 5,
                comment: 'Fixed all electrical issues quickly and safely. Highly recommended!',
                taskDescription: 'Electrical rewiring',
                timeAgo: '1 month ago',
            },
        ],
    },
    'user-9': {
        userId: 'user-9',
        name: 'Anesu Mapfumo',
        avatar: '/avatars/54.jpg',
        isOnline: false,
        lastOnline: '5 hours ago',
        location: 'Bulawayo CBD',
        overallRating: 4.7,
        reviewCount: 34,
        completionRate: 89,
        completedTasksCount: 38,
        isIdVerified: false,
        education: ['Civil Engineering', 'Project Management'],
        reviews: [
            {
                id: 'review-16',
                reviewerName: 'Rudo Chihota',
                reviewerAvatar: '/avatars/53.jpg',
                rating: 5,
                comment: 'Managed our construction project professionally. Great communication and on-time delivery.',
                taskDescription: 'House construction project',
                timeAgo: '2 months ago',
            },
            {
                id: 'review-17',
                reviewerName: 'Nyasha Dube',
                reviewerAvatar: '/avatars/female89.jpg',
                rating: 4,
                comment: 'Good structural engineering advice. Helped us avoid major issues.',
                taskDescription: 'Structural assessment',
                timeAgo: '3 months ago',
            },
        ],
    },
    'user-10': {
        userId: 'user-10',
        name: 'Rudo Chihota',
        avatar: '/avatars/53.jpg',
        isOnline: false,
        lastOnline: '2 hours ago',
        location: 'Chitungwiza',
        overallRating: 5.0,
        reviewCount: 78,
        completionRate: 95,
        completedTasksCount: 84,
        isIdVerified: true,
        education: ['Quantity Surveying', 'Land Surveying'],
        categoryRatings: {
            communication: 5.0,
            punctuality: 4.9,
            eyeForDetail: 5.0,
            efficiency: 4.9,
        },
        reviews: [
            {
                id: 'review-18',
                reviewerName: 'Anesu Mapfumo',
                reviewerAvatar: '/avatars/54.jpg',
                rating: 5,
                comment: 'Very accurate land survey. Professional report helped us get council approval quickly.',
                taskDescription: 'Land surveying for new development',
                timeAgo: '1 month ago',
            },
            {
                id: 'review-19',
                reviewerName: 'Farai Chikwanha',
                reviewerAvatar: '/avatars/17.jpg',
                rating: 5,
                comment: 'Detailed quantity survey saved us money on material ordering. Highly recommend!',
                taskDescription: 'Building quantity survey',
                timeAgo: '2 months ago',
            },
        ],
    },
    'user-demo': {
        userId: 'user-demo',
        name: 'Tapfuma Chinake',
        avatar: '/avatars/63.jpg',
        isOnline: true,
        lastOnline: 'Online now',
        location: 'Harare, Zimbabwe',
        overallRating: 4.5,
        reviewCount: 12,
        completionRate: 90,
        completedTasksCount: 15,
        isIdVerified: true,
        education: ['Software Development'],
        reviews: [
            {
                id: 'review-demo-1',
                reviewerName: 'Tendai Moyo',
                reviewerAvatar: '/avatars/91.jpg',
                rating: 5,
                comment: 'Great communication and easy to work with!',
                taskDescription: 'Website design consultation',
                timeAgo: '1 week ago',
            },
        ],
    },
};

export function getProfileData(userId: string): ProfileData | null {
    return profilesData[userId] || null;
}
