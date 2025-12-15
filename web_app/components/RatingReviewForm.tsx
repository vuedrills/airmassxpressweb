'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface RatingReviewFormProps {
    taskId: string;
    revieweeId: string;
    revieweeName: string;
    onSubmit: (rating: number, comment: string, isPublic: boolean) => void;
    onCancel: () => void;
}

export function RatingReviewForm({
    taskId,
    revieweeId,
    revieweeName,
    onSubmit,
    onCancel,
}: RatingReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, comment, isPublic);
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="font-heading text-xl font-bold mb-4 text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                Leave a Review for {revieweeName}
            </h3>

            {/* Star Rating */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Rating
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-10 w-10 ${star <= (hoveredRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                        {rating === 5 && '⭐ Excellent!'}
                        {rating === 4 && '⭐ Very Good'}
                        {rating === 3 && '⭐ Good'}
                        {rating === 2 && '⭐ Fair'}
                        {rating === 1 && '⭐ Needs Improvement'}
                    </p>
                )}
            </div>

            {/* Review Comment */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Review (Optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience working with this person..."
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                    rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500
                </p>
            </div>

            {/* Public/Private Toggle */}
            <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                        Make this review public on {revieweeName}'s profile
                    </span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                >
                    Skip for Now
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className="flex-1 bg-[#1a2847] hover:bg-[#1a2847]/90"
                >
                    Submit Review
                </Button>
            </div>
        </div>
    );
}
