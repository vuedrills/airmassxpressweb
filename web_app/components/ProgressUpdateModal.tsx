'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { workflowHelpers } from '@/lib/workflow';
import { useStore } from '@/store/useStore';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ProgressUpdateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    currentUserId: string;
}

export default function ProgressUpdateModal({
    open,
    onOpenChange,
    task,
    currentUserId,
}: ProgressUpdateModalProps) {
    const [progress, setProgress] = useState<number[]>([task.progress || 0]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const addNotification = useStore((state) => state.addNotification);

    const handleSubmit = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            const result = workflowHelpers.updateTaskProgress(
                task.id,
                progress[0],
                currentUserId
            );

            // Add notification to store
            addNotification(result.notification);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onOpenChange(false);
                // Reset form
                setMessage('');
            }, 1500);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update progress';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError('');
            setSuccess(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        Update Progress
                    </DialogTitle>
                    <DialogDescription>
                        Update the progress of your work on this task
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-green-600">
                            Progress updated successfully!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 py-4">
                            {/* Progress Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Progress Percentage
                                    </label>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {progress[0]}%
                                    </span>
                                </div>
                                <Slider
                                    value={progress}
                                    onValueChange={setProgress}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Optional Message */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Message (Optional)
                                </label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Add a note about your progress..."
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#1a2847] hover:bg-[#1a2847]/90"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Progress'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
