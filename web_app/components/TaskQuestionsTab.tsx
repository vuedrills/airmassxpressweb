'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { User } from '@/types/user';
import { Comment } from '@/types/comment';
import { postQuestion } from '@/lib/api';
import { QuestionItem } from './QuestionItem';
import { QuestionImageUpload } from './QuestionImageUpload';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskQuestionsTabProps {
    task: Task;
    currentUser: User | null;
    questions: Comment[];
    isLoading: boolean;
    onRefresh: () => void;
}

export function TaskQuestionsTab({ task, currentUser, questions, isLoading, onRefresh }: TaskQuestionsTabProps) {
    const [isPosting, setIsPosting] = useState(false);

    // New Question Form
    const [questionContent, setQuestionContent] = useState('');
    const [questionImages, setQuestionImages] = useState<string[]>([]);

    const handlePostQuestion = async () => {
        if (!questionContent.trim()) return;

        setIsPosting(true);
        try {
            await postQuestion(task.id, questionContent, questionImages);
            toast.success("Question posted", {
                description: "Your question has been posted successfully.",
            });
            setQuestionContent('');
            setQuestionImages([]);
            onRefresh(); // Refresh list via parent
        } catch (error: any) {
            console.error('Failed to post question', error);
            toast.error("Error", {
                description: error.message || "Failed to post question. Please try again.",
            });
        } finally {
            setIsPosting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Ask Question Form */}
            {currentUser ? (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        Ask a Question
                    </h3>
                    <div className="space-y-4">
                        <textarea
                            value={questionContent}
                            onChange={(e) => setQuestionContent(e.target.value)}
                            className="w-full p-4 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                            placeholder={task.posterId === currentUser.id ? "Post a public update or clarification..." : "Ask the poster about specific details..."}
                            rows={3}
                        />
                        <QuestionImageUpload
                            pathPrefix={`task_questions/${task.id}/${currentUser.id}`}
                            onUploadComplete={setQuestionImages}
                            value={questionImages}
                            label="Attach photos (optional)"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handlePostQuestion}
                                disabled={!questionContent.trim() || isPosting}
                                className="bg-[#1a2847] hover:bg-[#2a3c63] text-white px-6"
                            >
                                {isPosting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Post Question
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 p-4 rounded-xl text-center text-blue-800 text-sm">
                    Please log in to ask questions.
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
                    Questions ({questions.length})
                </h3>

                {questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No questions yet. Be the first to ask!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question) => (
                            <QuestionItem
                                key={question.id}
                                comment={question}
                                currentUser={currentUser}
                                isTaskOwner={task.posterId === currentUser?.id}
                                onReplySuccess={onRefresh}
                                rootQuestionAuthorId={question.userId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
