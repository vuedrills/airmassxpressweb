'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, DollarSign, TrendingUp, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface OfferAcceptedModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    offer: any;
    escrowAmount: number;
}

export default function OfferAcceptedModal({
    open,
    onOpenChange,
    task,
    offer,
    escrowAmount,
}: OfferAcceptedModalProps) {
    const handleClose = () => {
        onOpenChange(false);
        // Scroll to progress card (at top of page)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className="rounded-full bg-green-100 p-3 mb-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <DialogTitle className="text-3xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                            Offer Accepted!
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Work will begin on your task shortly
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tasker Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-sm text-gray-700 mb-3">ASSIGNED TASKER</h3>
                        <div className="flex items-center gap-3">
                            <img
                                src={offer.tasker.avatar}
                                alt={offer.tasker.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                            />
                            <div>
                                <div className="font-bold text-gray-900">{offer.tasker.name}</div>
                                <div className="text-sm text-gray-600">
                                    {offer.tasker.rating} ★ • {offer.tasker.tasksCompleted} tasks
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm text-gray-700 mb-1">
                                    PAYMENT SECURED
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    ${escrowAmount} is now held in escrow and will be released when you approve the completed work.
                                </p>
                                <div className="font-heading text-2xl font-bold text-green-700" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                    ${escrowAmount}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-sm text-gray-700 mb-2">WHAT'S NEXT?</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>The tasker will update progress as they work</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Eye className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>You can monitor progress at the top of this page</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Review and release payment when work is complete</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Link href={`/browse?taskId=${task.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full"
                        >
                            View Progress
                        </Button>
                    </Link>
                    <Link href={`/messages?userId=${offer.tasker.id}`} className="flex-1">
                        <Button
                            className="w-full bg-[#1a2847] hover:bg-[#1a2847]/90"
                            onClick={() => onOpenChange(false)}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
