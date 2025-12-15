// Review and rating types
export interface TaskReview {
    id: string;
    taskId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    revieweeId: string;
    revieweeName: string;
    rating: number; // 1-5
    comment: string;
    isPublic: boolean;
    createdAt: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}
