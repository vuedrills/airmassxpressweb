'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, DollarSign, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ProgressUpdateModal from './ProgressUpdateModal';
import TaskCompletionButton from './TaskCompletionButton';
import ReviewTaskModal from './ReviewTaskModal';

interface TaskProgressCardProps {
    task: any; // Task type
    acceptedOffer?: any; // Offer type
    escrow?: any; // Escrow type
    currentUserId?: string; // Current logged in user
}

export default function TaskProgressCard({ task, acceptedOffer, escrow, currentUserId }: TaskProgressCardProps) {
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Don't show if task is still OPEN
    if (task.status === 'open') {
        return null;
    }

    // Check if current user is the accepted tasker
    const isTasker = currentUserId && acceptedOffer && currentUserId === acceptedOffer.taskerId;
    const isPoster = currentUserId && currentUserId === task.posterId;

    // Can update progress only if in_progress or revision_requested
    const canUpdateProgress = isTasker && (task.status === 'in_progress' || task.status === 'revision_requested');

    // Status configurations
    const statusConfig = {
        in_progress: {
            label: 'IN PROGRESS',
            color: 'bg-blue-100 text-blue-800',
            icon: Clock,
        },
        revision_requested: {
            label: 'REVISION REQUESTED',
            color: 'bg-yellow-100 text-yellow-800',
            icon: Clock,
        },
        completed: {
            label: 'COMPLETED',
            color: 'bg-green-100 text-green-800',
            icon: CheckCircle2,
        },
        dispute: {
            label: 'DISPUTE',
            color: 'bg-red-100 text-red-800',
            icon: Shield,
        },
    };

    const config = statusConfig[task.status as keyof typeof statusConfig];
    const StatusIcon = config?.icon;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
            {/* Header with Status */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {StatusIcon && <StatusIcon className="h-6 w-6 text-blue-600" />}
                    <div>
                        <div className="text-xs text-gray-600 mb-1">TASK STATUS</div>
                        <Badge className={`${config?.color} hover:${config?.color}`}>
                            {config?.label || task.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                {escrow && (
                    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-lg border border-blue-200">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                            <div className="text-xs text-gray-600">ESCROW</div>
                            <div className="font-bold text-gray-900">${escrow.amount}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar (only for in_progress or revision_requested) */}
            {(task.status === 'in_progress' || task.status === 'revision_requested') && task.progress !== undefined && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-blue-600">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-3" />
                </div>
            )}

            {/* Accepted Tasker Info */}
            {acceptedOffer && (
                <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-600 mb-2">ACCEPTED TASKER</div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/profile/${acceptedOffer.tasker.id}`}>
                                <img
                                    src={acceptedOffer.tasker.avatar}
                                    alt={acceptedOffer.tasker.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm hover:border-primary transition-colors cursor-pointer"
                                />
                            </Link>
                            <div>
                                <Link
                                    href={`/profile/${acceptedOffer.tasker.id}`}
                                    className="font-bold text-gray-900 hover:underline flex items-center gap-1"
                                >
                                    {acceptedOffer.tasker.name}
                                    {acceptedOffer.tasker.isVerified && (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                </Link>
                                <div className="text-sm text-gray-600">
                                    {acceptedOffer.tasker.rating} ★ • {acceptedOffer.tasker.tasksCompleted} tasks
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-600">OFFER AMOUNT</div>
                            <div className="font-heading text-2xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                ${acceptedOffer.amount}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Revision Message (if applicable) */}
            {task.status === 'revision_requested' && task.revisionMessage && (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="text-sm font-semibold text-yellow-800 mb-1">Revision Request</div>
                    <div className="text-sm text-yellow-700">{task.revisionMessage}</div>
                </div>
            )}

            {/* Update Progress Button (only for tasker) */}
            {canUpdateProgress && (
                <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
                    <Button
                        onClick={() => setShowProgressModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 justify-center"
                    >
                        <TrendingUp className="h-5 w-5" />
                        Update Progress
                    </Button>

                    {/* Mark Complete Button - shown when progress >= 90% */}
                    {currentUserId && (
                        <TaskCompletionButton
                            task={task}
                            currentUserId={currentUserId}
                            isTasker={isTasker}
                        />
                    )}
                </div>
            )}

            {/* Progress Update Modal */}
            {currentUserId && (
                <ProgressUpdateModal
                    open={showProgressModal}
                    onOpenChange={setShowProgressModal}
                    task={task}
                    currentUserId={currentUserId}
                />
            )}

            {/* Review Task Button (only for poster when progress = 100%) */}
            {isPoster && task.progress === 100 && task.status === 'in_progress' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <Button
                        onClick={() => setShowReviewModal(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2 justify-center"
                        size="lg"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                        Review Completed Work
                    </Button>
                </div>
            )}

            {/* Review Task Modal */}
            {currentUserId && (
                <ReviewTaskModal
                    open={showReviewModal}
                    onOpenChange={setShowReviewModal}
                    task={task}
                    currentUserId={currentUserId}
                    isPoster={isPoster || false}
                />
            )}
        </div>
    );
}
