'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Star } from 'lucide-react';
import { ReviewCard } from './ReviewCard';

interface Review {
    id: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    rating_communication: number;
    rating_time: number;
    rating_professionalism: number;
    comment: string;
    timeAgo: string;
    taskDescription: string;
    reply?: string;
    replyCreatedAt?: string;
}

interface ReviewsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    reviews: Review[];
    overallRating: number;
    reviewCount: number;
    isTasker?: boolean;
    isOwner?: boolean;
}

import { replyReview } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ReviewsDialog({ isOpen, onOpenChange, reviews, overallRating, reviewCount, isTasker = true, isOwner = false }: ReviewsDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const handleReply = async (reviewId: string, text: string) => {
        setIsSubmitting(reviewId);
        try {
            await replyReview(reviewId, text);
            router.refresh(); // Refresh to show new data
            // Optimistically update local state could be complex with props, rely on refresh or could use state copy
            // For now, simpler to refresh.
        } catch (error) {
            console.error('Failed to reply:', error);
            alert('Failed to send reply');
        } finally {
            setIsSubmitting(null);
        }
    };
    // Calculate Averages
    const avgComm = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (r.rating_communication || 0), 0) / reviews.length
        : 0;
    const avgTime = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (r.rating_time || 0), 0) / reviews.length
        : 0;
    const avgProf = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (r.rating_professionalism || 0), 0) / reviews.length
        : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="!max-w-[1100px] !w-[95vw] !h-[85vh] !p-0 !gap-0 flex flex-col rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-center relative bg-white shrink-0">
                    <DialogTitle className="text-xl font-bold text-[#1a2847]">
                        Reviews
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 bg-gray-100 rounded-full w-8 h-8 hover:bg-gray-200"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Content - Two Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Stats Panel - Fixed Width (Only for Taskers) */}
                    {isTasker && (
                        <div className="w-[350px] min-w-[350px] p-8 border-r bg-[#fafbfc] overflow-y-auto">
                            {/* Overall Rating */}
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-[#1a2847] mb-2">
                                    Overall rating
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-5xl font-bold text-[#1a2847]">
                                        {overallRating.toFixed(1)}
                                    </span>
                                    <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                                </div>
                                <p className="text-base text-gray-500 font-medium">
                                    {reviewCount} reviews
                                </p>
                            </div>

                            {/* Rating Bars */}
                            <div className="space-y-5">
                                <RatingBarItem label="Communication" value={avgComm} />
                                <RatingBarItem label="Time Management" value={avgTime} />
                                <RatingBarItem label="Professionalism" value={avgProf} />
                            </div>
                        </div>
                    )}

                    {/* RIGHT: Reviews List */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                reviewerName={review.reviewerName}
                                reviewerAvatar={review.reviewerAvatar}
                                rating={review.rating}
                                comment={review.comment}
                                timeAgo={review.timeAgo}
                                taskDescription={review.taskDescription}
                                reply={review.reply}
                                replyCreatedAt={review.replyCreatedAt}
                                canReply={isOwner && !review.reply}
                                onReply={(text: string) => handleReply(review.id, text)}
                            />
                        ))}
                        {reviews.length === 0 && (
                            <p className="text-center text-gray-400 mt-10 text-base">
                                No reviews yet.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Separate Rating Bar component
function RatingBarItem({ label, value }: { label: string; value: number }) {
    const safeValue = isNaN(value) ? 0 : value;
    const percentage = Math.min(100, Math.max(0, (safeValue / 5) * 100));

    return (
        <div className="flex items-center gap-4">
            <span className="w-32 text-sm font-semibold text-[#1a2847] shrink-0">
                {label}
            </span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-8 text-sm font-bold text-[#1a2847] text-right shrink-0">
                {safeValue.toFixed(1)}
            </span>
        </div>
    );
}
