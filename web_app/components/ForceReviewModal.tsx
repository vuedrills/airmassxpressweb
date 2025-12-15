'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { Task } from '@/types';

interface PendingReviewTask extends Task {
    // Add any specific fields if needed
}

export function ForceReviewModal() {
    const loggedInUser = useStore((state) => state.loggedInUser);
    const [pendingTasks, setPendingTasks] = useState<PendingReviewTask[]>([]);
    const [currentTask, setCurrentTask] = useState<PendingReviewTask | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [ratingComm, setRatingComm] = useState(5);
    const [ratingTime, setRatingTime] = useState(5);
    const [ratingProf, setRatingProf] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch tasks that need review
    useEffect(() => {
        if (!loggedInUser) return;

        const checkPendingReviews = async () => {
            try {
                // In a real app, you'd have an endpoint like /users/pending-reviews
                // For now, we'll simulate by fetching completed tasks where user is poster 
                // and checking if they have a review (this would be inefficient in prod).
                // Assuming the backend has been updated to filter this efficiently.

                const tasks = await apiFetch('/reviews/pending');
                setPendingTasks(tasks);

                if (tasks.length > 0) {
                    setCurrentTask(tasks[0]);
                }

            } catch (error) {
                console.error('Failed to check pending reviews', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkPendingReviews();
    }, [loggedInUser]);

    const handleSubmit = async () => {
        if (!currentTask) return;
        setIsSubmitting(true);

        try {
            await apiFetch('/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_id: currentTask.id,
                    rating_communication: ratingComm,
                    rating_time: ratingTime,
                    rating_professionalism: ratingProf,
                    comment: comment
                }),
            });

            // Remove from list
            const remaining = pendingTasks.filter(t => t.id !== currentTask.id);
            setPendingTasks(remaining);
            if (remaining.length > 0) {
                setCurrentTask(remaining[0]);
                // Reset form
                setRatingComm(5);
                setRatingTime(5);
                setRatingProf(5);
                setComment('');
            } else {
                setCurrentTask(null);
            }

        } catch (error) {
            console.error('Failed to submit review', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dev trigger to test modal (remove in prod)
    useEffect(() => {
        // expose function to window for testing
        (window as any).triggerReviewModal = (task: PendingReviewTask) => {
            setPendingTasks([task]);
            setCurrentTask(task);
        };
    }, []);

    if (!currentTask) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1a2847] mb-2">Review Completed Task</h2>
                    <p className="text-gray-600">
                        Task: <span className="font-semibold">{currentTask.title}</span>
                    </p>
                    <p className="text-xs text-red-500 mt-2 font-medium">
                        Your feedback is required to continue using the app.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Communication */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Communication</label>
                            <span className="text-sm font-bold text-blue-600">{ratingComm}/5</span>
                        </div>
                        <Slider
                            value={[ratingComm]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(vals) => setRatingComm(vals[0])}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                            <span>Poor</span>
                            <span>Excellent</span>
                        </div>
                    </div>

                    {/* Time Management */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Time Management</label>
                            <span className="text-sm font-bold text-blue-600">{ratingTime}/5</span>
                        </div>
                        <Slider
                            value={[ratingTime]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(vals) => setRatingTime(vals[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                            <span>Late</span>
                            <span>On Time</span>
                        </div>
                    </div>

                    {/* Professionalism */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Professionalism</label>
                            <span className="text-sm font-bold text-blue-600">{ratingProf}/5</span>
                        </div>
                        <Slider
                            value={[ratingProf]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(vals) => setRatingProf(vals[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                            <span>Unprofessional</span>
                            <span>Pro</span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                            placeholder="Share details about your experience..."
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-[#1a2847] hover:bg-[#2a3857] text-white py-6 text-lg font-bold rounded-xl"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
