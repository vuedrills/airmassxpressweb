'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';

interface CompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitle: string;
    taskerName: string;
    amount: number;
    onReleasePayment: () => void;
    onRequestRevisions: (message: string) => void;
    onRaiseDispute: (reason: string, description: string) => void;
}

type ActionStep = 'main' | 'revisions' | 'dispute' | 'confirm_release';

export function CompletionModal({
    isOpen,
    onClose,
    taskTitle,
    taskerName,
    amount,
    onReleasePayment,
    onRequestRevisions,
    onRaiseDispute,
}: CompletionModalProps) {
    const [step, setStep] = useState<ActionStep>('main');
    const [revisionMessage, setRevisionMessage] = useState('');
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDescription, setDisputeDescription] = useState('');

    const handleClose = () => {
        setStep('main');
        setRevisionMessage('');
        setDisputeReason('');
        setDisputeDescription('');
        onClose();
    };

    const handleConfirmRelease = () => {
        onReleasePayment();
        handleClose();
    };

    const handleSubmitRevisions = () => {
        if (revisionMessage.trim()) {
            onRequestRevisions(revisionMessage);
            handleClose();
        }
    };

    const handleSubmitDispute = () => {
        if (disputeReason && disputeDescription.trim()) {
            onRaiseDispute(disputeReason, disputeDescription);
            handleClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        {step === 'main' && 'Task Complete'}
                        {step === 'confirm_release' && 'Confirm Payment Release'}
                        {step === 'revisions' && 'Request Revisions'}
                        {step === 'dispute' && 'Raise Dispute'}
                    </DialogTitle>
                    {step === 'main' && (
                        <DialogDescription>
                            {taskerName} has marked the task as complete. Please review the work and choose an action.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Main Actions */}
                {step === 'main' && (
                    <div className="space-y-3 pt-4">
                        <Button
                            onClick={() => setStep('confirm_release')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4"
                        >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            <div className="text-left flex-1">
                                <div className="font-semibold">Release Payment</div>
                                <div className="text-xs text-white/80">Pay ${amount} to {taskerName}</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => setStep('revisions')}
                            variant="outline"
                            className="w-full h-auto py-4"
                        >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            <div className="text-left flex-1">
                                <div className="font-semibold">Request Revisions</div>
                                <div className="text-xs text-gray-600">Ask for changes or improvements</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => setStep('dispute')}
                            variant="outline"
                            className="w-full h-auto py-4 border-red-200 text-red-700 hover:bg-red-50"
                        >
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            <div className="text-left flex-1">
                                <div className="font-semibold">Raise Dispute</div>
                                <div className="text-xs text-red-600">Report an issue with the work</div>
                            </div>
                        </Button>
                    </div>
                )}

                {/* Confirm Release */}
                {step === 'confirm_release' && (
                    <div className="space-y-4 pt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-900 mb-2">
                                You are about to release <span className="font-bold">${amount}</span> to {taskerName}.
                            </p>
                            <p className="text-xs text-green-700">
                                This action cannot be undone. The payment will be processed immediately.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setStep('main')} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmRelease} className="flex-1 bg-green-600 hover:bg-green-700">
                                Confirm Release
                            </Button>
                        </div>
                    </div>
                )}

                {/* Request Revisions */}
                {step === 'revisions' && (
                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                What needs to be revised?
                            </label>
                            <textarea
                                value={revisionMessage}
                                onChange={(e) => setRevisionMessage(e.target.value)}
                                placeholder="Describe the changes or improvements needed..."
                                className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setStep('main')} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmitRevisions}
                                disabled={!revisionMessage.trim()}
                                className="flex-1 bg-[#1a2847] hover:bg-[#1a2847]/90"
                            >
                                Send Request
                            </Button>
                        </div>
                    </div>
                )}

                {/* Raise Dispute */}
                {step === 'dispute' && (
                    <div className="space-y-4 pt-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Reason for dispute
                            </label>
                            <select
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Select a reason...</option>
                                <option value="work_not_completed">Work not completed</option>
                                <option value="poor_quality">Poor quality</option>
                                <option value="not_as_described">Not as described</option>
                                <option value="payment_issue">Payment issue</option>
                                <option value="communication_issue">Communication issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={disputeDescription}
                                onChange={(e) => setDisputeDescription(e.target.value)}
                                placeholder="Please provide details about the issue..."
                                className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                                rows={4}
                            />
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-900">
                                Our mediation team will review your dispute and contact both parties within 24-48 hours.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setStep('main')} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmitDispute}
                                disabled={!disputeReason || !disputeDescription.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Submit Dispute
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
