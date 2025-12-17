'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOffersByTask, acceptOffer, completeTask, fetchMessagesByConversation, sendMessage, fetchConversations, fetchTaskQuestions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Star, MessageCircle, CheckCircle2, Clock, MapPin, BadgeCheck, Calendar, Send } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import OfferAcceptedModal from './OfferAcceptedModal';
import InvoiceModal from './InvoiceModal';
import { getAvatarSrc } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Task, Message } from '@/types';
import { TaskQuestionsTab } from './TaskQuestionsTab';
import { useWebSocket } from '@/components/providers/WebSocketProvider';

interface TaskDetailTabsProps {
    task: Task;
}



// Helper function to safely format dates
const formatDate = (dateString: any): string => {
    if (!dateString) return 'Recently';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Recently';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
        return 'Recently';
    }
};

// Note: Offers are fetched from API - see useQuery below


export default function TaskDetailTabs({ task }: TaskDetailTabsProps) {
    const [activeTab, setActiveTab] = useState<'offers' | 'questions' | 'chat'>('offers');
    const [showAllReplies, setShowAllReplies] = useState(false); // Legacy
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState(''); // Legacy
    const [showOfferAcceptedModal, setShowOfferAcceptedModal] = useState(false);
    const [acceptedOfferData, setAcceptedOfferData] = useState<any>(null);
    const [showReplyModal, setShowReplyModal] = useState(false); // Legacy
    const [showVerificationInfo, setShowVerificationInfo] = useState(false);

    // New state for chat and completion
    const [chatMessage, setChatMessage] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get logged-in user from store
    const loggedInUser = useStore((state) => state.loggedInUser);
    const queryClient = useQueryClient();

    // Check if logged-in user is the task owner
    const isTaskOwner = loggedInUser && loggedInUser.id === task.posterId;
    const isAssignedTasker = loggedInUser && task.acceptedOffer && task.acceptedOffer.taskerId === loggedInUser.id;
    const canChat = (isTaskOwner || isAssignedTasker) && task.status !== 'open';

    // Fetch offers from API
    const { data: offers = [], isLoading: offersLoading } = useQuery({
        queryKey: ['offers', task.id],
        queryFn: () => fetchOffersByTask(task.id),
    });

    // For now, keep questions as mock data
    const selectedOffer = offers.find(o => o.id === selectedOfferId);

    // Fetch questions from API
    const { data: questions = [], isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
        queryKey: ['questions', task.id],
        queryFn: () => fetchTaskQuestions(task.id),
    });

    // Real-time Updates
    const { subscribe, unsubscribe } = useWebSocket();

    useEffect(() => {
        if (!task.id) return;

        const handleUpdate = (data: any) => {
            console.log('⚡ WebSocket Update:', data.type);
            switch (data.type) {
                case 'question_created':
                case 'reply_created':
                    refetchQuestions();
                    break;
                case 'offer_created':
                case 'offer_updated':
                    queryClient.invalidateQueries({ queryKey: ['offers', task.id] });
                    break;
                case 'task_updated':
                    queryClient.invalidateQueries({ queryKey: ['task', task.id] });
                    // Also refresh offers in case status changed impacting offers
                    queryClient.invalidateQueries({ queryKey: ['offers', task.id] });
                    break;
            }
        };

        const topic = `task_updates:${task.id}`;
        subscribe(topic, handleUpdate);

        return () => {
            unsubscribe(topic, handleUpdate);
        };
    }, [task.id, subscribe, unsubscribe, refetchQuestions, queryClient]);

    // Chat Logic
    const conversationId = (task as any).conversationId || (task.acceptedOffer as any)?.conversationId; // Fallback

    const { data: messages = [], refetch: refetchMessages } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => conversationId ? fetchMessagesByConversation(conversationId) : Promise.resolve([]),
        enabled: !!conversationId && activeTab === 'chat',
        refetchInterval: activeTab === 'chat' ? 5000 : false, // Poll every 5s if chat is open
    });

    // Scroll to bottom of chat
    useEffect(() => {
        if (activeTab === 'chat' && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim() || !conversationId) return;

        try {
            await sendMessage(conversationId, chatMessage);
            setChatMessage('');
            refetchMessages();
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    // Task Completion
    const handleCompleteTask = async () => {
        if (!confirm('Are you sure you want to mark this task as complete? This will generate an invoice.')) return;
        try {
            const result = await completeTask(task.id);
            setInvoiceData(result.invoice);
            setShowInvoiceModal(true);
            queryClient.invalidateQueries({ queryKey: ['task', task.id] });
        } catch (error) {
            alert('Failed to complete task');
        }
    };

    // Offer Acceptance
    const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
    const [offerToAccept, setOfferToAccept] = useState<string | null>(null);

    const handleAcceptOffer = (offerId: string) => {
        if (!loggedInUser) {
            alert('Please log in to accept offers.');
            return;
        }
        setOfferToAccept(offerId);
        setShowAcceptConfirmation(true);
    };

    const confirmAcceptance = async () => {
        if (!offerToAccept) return;
        try {
            const response = await acceptOffer(offerToAccept);
            // Response has { offer, conversation_id, escrow }

            const acceptedOffer = offers.find(o => o.id === offerToAccept);
            setAcceptedOfferData({
                task,
                offer: acceptedOffer,
                escrowAmount: response?.escrow?.amount || acceptedOffer?.amount || 0, // Use real Amount with fallback
            });
            setShowOfferAcceptedModal(true);
            setShowAcceptConfirmation(false);

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['task', task.id] });
            queryClient.invalidateQueries({ queryKey: ['offers', task.id] });

            // Force reload to show Chat tab (since task prop might not update immediately if from parent prop)
            window.location.reload();
        } catch (error: any) {
            console.error('Accept offer error:', error);
            alert(error.message || 'Failed to accept offer');
        }
    };

    // Legacy reply handlers (kept minimal)
    const handleOpenReplyModal = (offerId: string) => { setSelectedOfferId(offerId); setShowReplyModal(true); };
    const handleCloseReplyModal = () => { setShowReplyModal(false); setSelectedOfferId(null); };

    return (
        <div className="mt-8 border-t pt-6">
            {/* Connected Tab Bar */}
            <div className="flex gap-0 mb-6 bg-gray-100 rounded-lg p-1 max-w-2xl mx-auto">
                <button
                    onClick={() => setActiveTab('offers')}
                    className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'offers'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Offers ({offers.length})
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'questions'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Questions ({questions.length})
                </button>
            </div>

            <div className="py-2">
                {activeTab === 'offers' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {offers.length > 0 ? (
                            offers.map((offer) => (
                                <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Header with avatar, name, and price */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            {/* User Avatar */}
                                            <Link href={`/profile/${offer.tasker.id}`} className="flex-shrink-0">
                                                <img
                                                    src={getAvatarSrc(offer.tasker.avatar) || '/avatars/63.jpg'}
                                                    alt={offer.tasker.name}
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                />
                                            </Link>
                                            <div>
                                                <Link href={`/profile/${offer.tasker.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors block">
                                                    {offer.tasker.name}
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm mt-0.5">
                                                    {offer.tasker.isVerified && (
                                                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs font-medium">
                                                            <CheckCircle2 className="h-3 w-3" /> Verified
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-medium">
                                                        <Star className="h-3 w-3 fill-amber-500" /> {offer.tasker.rating || 'New'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Offer Price */}
                                        <div className="text-right">
                                            <div className="font-heading text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                                ${offer.amount}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">OFFER PRICE</div>
                                        </div>
                                    </div>

                                    {/* Availability Badge */}
                                    {offer.availability && (
                                        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 mb-4">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {offer.availability}
                                        </div>
                                    )}

                                    {/* Offer Description */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                                        {offer.description}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex gap-4 text-xs text-gray-500 font-medium">
                                            <span>{formatDate(offer.createdAt)}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenReplyModal(offer.id)}
                                                className="h-9"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Reply
                                            </Button>

                                            {offer.status === 'pending' && isTaskOwner && (
                                                <Button
                                                    size="sm"
                                                    className="h-9 bg-[#1a2847] hover:bg-[#1a2847]/90 text-white shadow-sm"
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                >
                                                    Accept Offer
                                                </Button>
                                            )}
                                            {offer.status === 'accepted' && (
                                                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="h-4 w-4" /> Accepted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : offersLoading ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">Loading offers...</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Clock className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1">No offers yet</h3>
                                <p className="text-sm text-gray-500">Be the first to make an offer on this task!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <TaskQuestionsTab
                        task={task}
                        currentUser={loggedInUser}
                        questions={questions}
                        isLoading={questionsLoading}
                        onRefresh={refetchQuestions}
                    />
                )}
            </div>

            {/* Action Bar for Assigned Tasker */}
            {isAssignedTasker && task.status !== 'completed' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200 z-50 flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <span className="text-sm font-medium text-gray-600">You are working on this task</span>
                    <Button onClick={handleCompleteTask} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                        Mark Complete
                    </Button>
                </div>
            )}

            {/* Existing verification modal ... */}
            <Dialog open={showVerificationInfo} onOpenChange={setShowVerificationInfo}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 fill-blue-600 text-white" />
                            Verified Tasker
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-700">
                            Taskers with this badge have been verified with a Government Photo ID.
                        </p>
                        <a href="#" className="text-blue-600 hover:underline inline-block">
                            Learn more
                        </a>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reply Modal */}
            <Dialog open={showReplyModal} onOpenChange={handleCloseReplyModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reply</DialogTitle></DialogHeader>
                    <div className="py-4 text-center text-gray-500">Replies coming soon via API</div>
                </DialogContent>
            </Dialog>

            {/* Offer Accepted Success Modal */}
            {acceptedOfferData && (
                <OfferAcceptedModal
                    open={showOfferAcceptedModal}
                    onOpenChange={setShowOfferAcceptedModal}
                    task={acceptedOfferData.task}
                    offer={acceptedOfferData.offer}
                    escrowAmount={acceptedOfferData.escrowAmount}
                />
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showAcceptConfirmation} onOpenChange={setShowAcceptConfirmation}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Offer Acceptance</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to accept this offer? This action is legally binding.
                            By clicking confirm, you agree to the terms and conditions and the agreed amount will be held in escrow.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setShowAcceptConfirmation(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAcceptance} className="bg-[#1a2847] hover:bg-[#1a2847]/90">
                            Confirm Acceptance
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invoice Modal */}
            <InvoiceModal open={showInvoiceModal} onOpenChange={setShowInvoiceModal} invoiceData={invoiceData} />
        </div>
    );
}
