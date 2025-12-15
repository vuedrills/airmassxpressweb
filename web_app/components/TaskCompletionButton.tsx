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
import { workflowHelpers } from '@/lib/workflow';
import { useStore } from '@/store/useStore';
import { AlertCircle, CheckCircle, PackageCheck } from 'lucide-react';

interface TaskCompletionButtonProps {
    task: any;
    currentUserId: string;
    isTasker: boolean;
}

export default function TaskCompletionButton({ task, currentUserId, isTasker }: TaskCompletionButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const addNotification = useStore((state) => state.addNotification);

    // Only show button if:
    // - User is the tasker
    // - Task is in_progress
    // - Progress is at least 90% (almost done)
    const canMarkComplete = isTasker && task.status === 'in_progress' && task.progress >= 90;

    if (!canMarkComplete) {
        return null;
    }

    const handleMarkComplete = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            const result = workflowHelpers.markTaskComplete(task.id, currentUserId);

            // Add notification
            addNotification(result.notification);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowConfirm(false);
                // Optionally reload page or refetch data
                window.location.reload();
            }, 2000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to mark task as complete';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 justify-center"
                size="lg"
            >
                <PackageCheck className="h-5 w-5" />
                Mark Task Complete
            </Button>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                            Mark Task Complete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure the work is complete and ready for review?
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="py-8 text-center">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-green-600">
                                Task marked complete!
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                The task poster will review your work
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="py-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-700">
                                        Once you mark this task as complete:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                                        <li>The task poster will be notified</li>
                                        <li>They can review and release payment</li>
                                        <li>They may request revisions if needed</li>
                                    </ul>
                                </div>

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
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleMarkComplete}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? 'Marking Complete...' : 'Confirm'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
