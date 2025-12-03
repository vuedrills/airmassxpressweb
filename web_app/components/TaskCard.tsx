import Link from 'next/link';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin, MessageCircle, CheckCircle } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    return (
        <Link
            href={`/tasks/${task.id}`}
            className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
            {/* Header with Poster Info */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={task.poster?.avatar} />
                        <AvatarFallback>{task.poster?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{task.poster?.name}</span>
                            {task.poster?.isVerified && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>★ {task.poster?.rating.toFixed(1)}</span>
                            <span>({task.poster?.reviewCount})</span>
                        </div>
                    </div>
                </div>
                <span className="font-bold text-primary text-xl">${task.budget}</span>
            </div>

            {/* Task Title and Description */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{task.description}</p>

            {/* Category Badge */}
            <Badge variant="secondary" className="mb-3">
                {task.category}
            </Badge>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{task.location.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{task.offerCount} {task.offerCount === 1 ? 'offer' : 'offers'}</span>
                </div>
            </div>
        </Link>
    );
}
