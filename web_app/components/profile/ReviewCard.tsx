'use client';

import { Star } from 'lucide-react';

interface ReviewCardProps {
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    comment: string;
    timeAgo: string;
    taskDescription?: string;
    reply?: string;
    replyCreatedAt?: string;
    canReply?: boolean;
    onReply?: (text: string) => Promise<void>;
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ReviewCard({
    reviewerName,
    reviewerAvatar,
    rating,
    comment,
    timeAgo,
    taskDescription,
    reply,
    replyCreatedAt,
    canReply,
    onReply
}: ReviewCardProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitReply = async () => {
        if (!replyText.trim() || !onReply) return;

        setIsSubmitting(true);
        try {
            await onReply(replyText);
            setIsReplying(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mb-8 last:mb-0">
            {/* Header: Avatar, Name, Stars, Time */}
            <div className="flex items-start gap-4 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    <img
                        src={reviewerAvatar || '/avatars/default.png'}
                        alt={reviewerName}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1a2847] text-base mb-1">
                        {reviewerName}
                    </h4>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-gray-200 text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-400">{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Comment Box - Styled like speech bubble */}
            {comment && (
                <div className="ml-16 mb-2">
                    <div className="bg-[#e8edf4] rounded-xl rounded-tl-none px-4 py-3 text-[#1a2847] text-sm leading-relaxed relative">
                        {comment}
                    </div>
                </div>
            )}

            {/* Reply Section */}
            {reply && (
                <div className="ml-16 mb-2 flex justify-end">
                    <div className="max-w-[85%]">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs text-gray-400">Response from tasker • {replyCreatedAt || 'Recently'}</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tr-none px-4 py-3 text-[#1a2847] text-sm leading-relaxed">
                            {reply}
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Input Form */}
            {canReply && !reply && (
                <div className="ml-16 mt-2">
                    {!isReplying ? (
                        <button
                            onClick={() => setIsReplying(true)}
                            className="text-sm text-blue-600 font-semibold hover:underline"
                        >
                            Reply
                        </button>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-3 border">
                            <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                className="mb-2 bg-white min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsReplying(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Task Description - Below comment */}
            {taskDescription && (
                <div className="ml-16 mt-1">
                    <span className="text-sm text-[#6b7fa3] font-medium block">
                        Task: {taskDescription}
                    </span>
                </div>
            )}
        </div>
    );
}
