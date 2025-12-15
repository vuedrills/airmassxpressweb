'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface TaskProgressProps {
    taskId: string;
    taskTitle: string;
    currentProgress: number;
    taskerName: string;
    taskerAvatar: string;
    isTasker: boolean; // Is current user the tasker?
    onMarkComplete?: () => void;
    onUpdateProgress?: (progress: number) => void;
}

export function TaskProgress({
    taskId,
    taskTitle,
    currentProgress,
    taskerName,
    taskerAvatar,
    isTasker,
    onMarkComplete,
    onUpdateProgress,
}: TaskProgressProps) {
    const progressSteps = [0, 25, 50, 75, 100];

    return (
        <div className="bg-white rounded-lg border p-6">
            <h2 className="font-heading text-2xl font-bold mb-6 text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                Task Progress
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-[#1a2847]">{currentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${currentProgress}%`,
                            backgroundColor: currentProgress === 100 ? '#22c55e' : '#1a2847',
                        }}
                    />
                </div>
            </div>

            {/* Progress Steps (for tasker only) */}
            {isTasker && currentProgress < 100 && (
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Update progress:</p>
                    <div className="flex gap-2">
                        {progressSteps.filter(step => step > currentProgress && step < 100).map((step) => (
                            <Button
                                key={step}
                                size="sm"
                                variant="outline"
                                onClick={() => onUpdateProgress?.(step)}
                                className="text-xs"
                            >
                                {step}%
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tasker Info */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <img
                    src={taskerAvatar}
                    alt={taskerName}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <div className="text-xs text-gray-600 mb-1">WORKING ON THIS TASK</div>
                    <div className="font-semibold text-gray-900">{taskerName}</div>
                </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className={`h-5 w-5 ${currentProgress > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={currentProgress > 0 ? 'text-gray-900' : 'text-gray-400'}>Work Started</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className={`h-5 w-5 ${currentProgress >= 50 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={currentProgress >= 50 ? 'text-gray-900' : 'text-gray-400'}>Halfway There</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className={`h-5 w-5 ${currentProgress === 100 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className={currentProgress === 100 ? 'text-gray-900' : 'text-gray-400'}>Work Completed</span>
                </div>
            </div>

            {/* Mark Complete Button (for tasker only) */}
            {isTasker && currentProgress < 100 && (
                <Button
                    onClick={onMarkComplete}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Complete
                </Button>
            )}

            {/* Completion Message */}
            {currentProgress === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-900">
                        {isTasker ? 'Task marked as complete!' : 'Tasker has completed the work. Please review and release payment.'}
                    </p>
                </div>
            )}
        </div>
    );
}
