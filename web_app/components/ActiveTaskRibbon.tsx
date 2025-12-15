'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchActiveTaskerTasks } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { useRouter } from 'next/navigation';

export function ActiveTaskRibbon() {
    const { loggedInUser } = useStore();
    const router = useRouter();
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);

    const { data: activeTask, isLoading } = useQuery({
        queryKey: ['activeTask', loggedInUser?.id],
        queryFn: fetchActiveTaskerTasks,
        enabled: !!loggedInUser && (loggedInUser.isTasker || loggedInUser.role === 'tasker'),
        refetchInterval: 30000, // Check every 30s
    });

    if (!activeTask || isLoading) return null;

    return (
        <>
            <div className="w-full bg-blue-600 text-white shadow-md">
                <div className="container mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-semibold whitespace-nowrap">Active Task:</span>
                        <span className="truncate opacity-90">{activeTask.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/tasks/${activeTask.id}`}>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1 text-xs bg-white/20 hover:bg-white/30 text-white border-none"
                            >
                                <ExternalLink size={14} />
                                Details
                            </Button>
                        </Link>

                        <Link href={`/messages?conversationId=${activeTask.conversationId || ''}&userId=${activeTask.posterId}`}>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1 text-xs bg-white/20 hover:bg-white/30 text-white border-none"
                            >
                                <MessageSquare size={14} />
                                Messages
                            </Button>
                        </Link>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 gap-1 text-xs bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                            onClick={() => setShowCompleteDialog(true)}
                        >
                            <CheckCircle size={14} />
                            Mark Complete
                        </Button>
                    </div>
                </div>
            </div>

            <CompleteTaskDialog
                isOpen={showCompleteDialog}
                onClose={() => setShowCompleteDialog(false)}
                taskId={activeTask.id}
                taskTitle={activeTask.title}
            />
        </>
    );
}
