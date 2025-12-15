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
import { Textarea } from '@/components/ui/textarea';
import { workflowHelpers } from '@/lib/workflow';
import { useStore } from '@/store/useStore';
import { AlertCircle, CheckCircle, DollarSign, EditIcon, AlertTriangle } from 'lucide-react';

interface ReviewTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    currentUserId: string;
    isPoster: boolean;
}

type ActionType = 'release' | 'revise' | 'dispute' | null;

export default function ReviewTaskModal({
    open,
    onOpenChange,
    task,
    currentUserId,
    isPoster,
}: ReviewTaskModalProps) {
    const [selectedAction, setSelectedAction] = useState<ActionType>(null);
    const [revisionMessage, setRevisionMessage] = useState('');
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDescription, setDisputeDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const addNotification = useStore((state) => state.addNotification);

    // Only show if poster and task progress is 100%
    if (!isPoster || task.progress !== 100) {
        return null;
    }

    const handleSubmit = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            if (selectedAction === 'release') {
                const result = workflowHelpers.releasePayment(task.id, currentUserId);
                addNotification(result.notification);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onOpenChange(false);
                    // Trigger the review modal instead of reloading
                    if ((window as any).triggerReviewModal) {
                        (window as any).triggerReviewModal(task);
                    }
                }, 2000);

            } else if (selectedAction === 'revise') {
                if (!revisionMessage.trim()) {
                    setError('Please provide details about what needs to be revised');
                    setIsSubmitting(false);
                    return;
                }
                const result = workflowHelpers.requestRevisions(task.id, revisionMessage, currentUserId);
                addNotification(result.notification);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onOpenChange(false);
                    setRevisionMessage('');
                    window.location.reload();
                }, 2000);

            } else if (selectedAction === 'dispute') {
                if (!disputeReason.trim() || !disputeDescription.trim()) {
                    setError('Please provide a reason and description for the dispute');
                    setIsSubmitting(false);
                    return;
                }
                const result = workflowHelpers.raiseDispute(task.id, disputeReason, disputeDescription, currentUserId);
                addNotification(result.notification);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onOpenChange(false);
                    setDisputeReason('');
                    setDisputeDescription('');
                    window.location.reload();
                }, 2000);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process action';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setSelectedAction(null);
        setRevisionMessage('');
        setDisputeReason('');
        setDisputeDescription('');
        setError('');
        setSuccess(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        Review Completed Task
                    </DialogTitle>
                    <DialogDescription>
                        The tasker has marked this task as complete. Choose an action below.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-green-600">
                            {selectedAction === 'release' && 'Payment released successfully!'}
                            {selectedAction === 'revise' && 'Revision request sent!'}
                            {selectedAction === 'dispute' && 'Dispute raised successfully!'}
                        </p>
                    </div>
                ) : !selectedAction ? (
                    // Action Selection
                    <div className="space-y-3 py-4">
                        <Button
                            onClick={() => setSelectedAction('release')}
                            className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 justify-center h-16"
                        >
                            <CheckCircle className="h-6 w-6" />
                            <div className="text-left">
                                <div className="font-bold">Approve Task</div>
                                <div className="text-xs opacity-90">Work is done & satisfactory</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => setSelectedAction('revise')}
                            variant="outline"
                            className="w-full flex items-center gap-2 justify-center h-16 border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                        >
                            <EditIcon className="h-6 w-6" />
                            <div className="text-left">
                                <div className="font-bold">Request Revisions</div>
                                <div className="text-xs opacity-70">Work needs changes</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => setSelectedAction('dispute')}
                            variant="outline"
                            className="w-full flex items-center gap-2 justify-center h-16 border-red-600 text-red-700 hover:bg-red-50"
                        >
                            <AlertTriangle className="h-6 w-6" />
                            <div className="text-left">
                                <div className="font-bold">Raise Dispute</div>
                                <div className="text-xs opacity-70">Serious issues with work</div>
                            </div>
                        </Button>
                    </div>
                ) : (
                    // Action Confirmation
                    <>
                        <div className="space-y-4 py-4">
                            {selectedAction === 'release' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 mb-2 font-semibold">
                                        Confirm Task Completion
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        By approving, you confirm the work has been done to your satisfaction.
                                        The task will be marked as completed.
                                    </p>
                                </div>
                            )}

                            {selectedAction === 'revise' && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        What needs to be revised?
                                    </label>
                                    <Textarea
                                        value={revisionMessage}
                                        onChange={(e) => setRevisionMessage(e.target.value)}
                                        placeholder="Please describe what changes are needed..."
                                        className="resize-none"
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Be specific about what needs to be changed
                                    </p>
                                </div>
                            )}

                            {selectedAction === 'dispute' && (
                                <div className="space-y-3">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-700 font-semibold mb-1">
                                            ⚠️ This is a serious action
                                        </p>
                                        <p className="text-xs text-red-600">
                                            Raising a dispute will put the payment on hold and involve our mediation team.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Dispute Reason
                                        </label>
                                        <input
                                            type="text"
                                            value={disputeReason}
                                            onChange={(e) => setDisputeReason(e.target.value)}
                                            placeholder="e.g., Work not completed as agreed"
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Detailed Description
                                        </label>
                                        <Textarea
                                            value={disputeDescription}
                                            onChange={(e) => setDisputeDescription(e.target.value)}
                                            placeholder="Provide detailed information about the issue..."
                                            className="resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}

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
                                onClick={() => setSelectedAction(null)}
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={
                                    selectedAction === 'release'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : selectedAction === 'revise'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                }
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
