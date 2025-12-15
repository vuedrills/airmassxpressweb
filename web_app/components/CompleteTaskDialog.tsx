import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { completeTask, createReview } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CompleteTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    taskTitle: string;
}

export function CompleteTaskDialog({ isOpen, onClose, taskId, taskTitle }: CompleteTaskDialogProps) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Rating required", {
                description: "Please select a star rating",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Mark task as complete
            await completeTask(taskId);

            // 2. Submit the review
            // Since the UI only has one star rating, we map it to all 3 specific ratings
            await createReview({
                taskId: taskId,
                ratingCommunication: rating,
                ratingTime: rating,
                ratingProfessionalism: rating,
                comment: review,
            });

            toast.success("Task Completed! 🎉", {
                description: "The poster has been notified and your review submitted.",
            });

            // Invalidate queries to update ribbon and lists
            queryClient.invalidateQueries({ queryKey: ['activeTask'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });

            onClose();
        } catch (error) {
            console.error('Failed to complete task:', error);
            toast.error("Error", {
                description: "Failed to mark task as complete. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Task as Complete</DialogTitle>
                    <DialogDescription>
                        You are marking "{taskTitle}" as done. Leave a review for the poster.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Rate your experience with the Poster</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 rounded-full transition-colors ${rating >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-200'}`}
                                >
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="review">Review (Optional)</Label>
                        <Textarea
                            id="review"
                            placeholder="How was it working with this poster?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? 'Submitting...' : 'Mark as Complete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
