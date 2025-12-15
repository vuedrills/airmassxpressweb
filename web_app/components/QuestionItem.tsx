'use client';

import { useState } from 'react';
import { Comment } from '@/types/comment';
import { User } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarSrc, formatDate, cn } from '@/lib/utils';
import { QuestionImageUpload } from './QuestionImageUpload';
import { replyQuestion } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface QuestionItemProps {
    comment: Comment;
    currentUser: User | null;
    isTaskOwner: boolean;
    onReplySuccess: () => void;
    depth?: number;
    rootQuestionAuthorId?: string; // New prop
}

export function QuestionItem({ comment, currentUser, isTaskOwner, onReplySuccess, depth = 0, rootQuestionAuthorId }: QuestionItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    // ... (lines 24-43 remain same)
    const [replyContent, setReplyContent] = useState('');
    const [replyImages, setReplyImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            // Flatten threads: If replying to a reply (depth > 0), reply to the parent question instead
            // effectively making it a sibling of the current comment
            const targetId = (depth > 0 && comment.parentId) ? comment.parentId : comment.id;
            await replyQuestion(targetId, replyContent, replyImages);
            setIsReplying(false);
            setReplyContent('');
            setReplyImages([]);
            onReplySuccess();
        } catch (error) {
            console.error('Failed to reply', error);
            alert('Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAuthor = currentUser?.id === comment.userId;
    const isRootAuthor = rootQuestionAuthorId && currentUser?.id === rootQuestionAuthorId;

    console.log(`[QuestionItem ${comment.id}]`, {
        user: comment.user?.name,
        depth,
        currentUser: currentUser?.id,
        commentUserId: comment.userId,
        rootQuestionAuthorId,
        isTaskOwner,
        isAuthor,
        isRootAuthor,
        CAN_REPLY: currentUser && (isTaskOwner || isAuthor || isRootAuthor)
    });

    return (
        <div className={cn("flex flex-col gap-2", depth > 0 && "ml-8 md:ml-12 border-l-2 border-gray-100 pl-4 mt-4")}>
            {/* ... (lines 50-80 remain same) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                    <Link href={`/profile/${comment.userId}`} className="flex-shrink-0">
                        <Avatar className="h-10 w-10 border border-gray-100 hover:ring-2 hover:ring-blue-100 transition-all cursor-pointer">
                            <AvatarImage src={getAvatarSrc(comment.user?.avatar_url || comment.user?.avatar)} />
                            <AvatarFallback>{comment.user?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                                {comment.user?.name}
                                {comment.userId === comment.user?.id}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                        {/* Images */}
                        {comment.images && comment.images.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                {comment.images.map((img, idx) => (
                                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                        <img src={img} alt={`Attachment ${idx}`} className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Reply Button */}
                        <div className="mt-2 flex items-center gap-4">
                            {currentUser && !isAuthor && (isTaskOwner || isRootAuthor) && (
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="text-xs text-blue-600 font-medium hover:underline"
                                >
                                    Reply
                                </button>
                            )}
                        </div>

                        {/* Reply Form */}
                        {isReplying && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="w-full p-3 border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="Write a reply..."
                                    rows={3}
                                />
                                <div className="mb-3">
                                    <QuestionImageUpload
                                        pathPrefix={`question_replies/${currentUser?.id}`}
                                        onUploadComplete={setReplyImages}
                                        value={replyImages}
                                        label="Attach photos (optional)"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>Cancel</Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReply}
                                        disabled={!replyContent.trim() || isSubmitting}
                                        className="bg-[#1a2847] text-white"
                                    >
                                        {isSubmitting && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                                        Post Reply
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recursive Children (Threaded Replies) */}
            {comment.children && comment.children.length > 0 && (
                <div className="flex flex-col">
                    {comment.children.map((child) => (
                        <QuestionItem
                            key={child.id}
                            comment={child}
                            currentUser={currentUser}
                            isTaskOwner={isTaskOwner}
                            onReplySuccess={onReplySuccess}
                            depth={depth + 1}
                            rootQuestionAuthorId={rootQuestionAuthorId} // Pass it down
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
