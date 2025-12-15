import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin, MessageCircle, CheckCircle } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
    task: Task;
    compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/tasks/${task.id}`)}
            className={`block bg-white border rounded-lg hover:shadow-lg transition-shadow cursor-pointer ${compact ? 'p-4' : 'p-6'}`}
        >
            {/* Header with Poster Info */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/profile/${task.poster?.id}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Avatar className={`${compact ? "h-8 w-8" : "h-10 w-10"} hover:ring-2 hover:ring-primary transition-all`}>
                            <AvatarImage src={task.poster?.avatar} />
                            <AvatarFallback>{task.poster?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/profile/${task.poster?.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`font-medium hover:underline ${compact ? 'text-xs' : 'text-sm'}`}
                            >
                                {task.poster?.name}
                            </Link>
                            {task.poster?.isVerified && (
                                <CheckCircle className="h-3 w-3 text-blue-500" />
                            )}
                        </div>
                        {!compact && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>★ {task.poster?.rating.toFixed(1)}</span>
                                <span>({task.poster?.reviewCount})</span>
                            </div>
                        )}
                    </div>
                </div>
                <span className={`font-bold text-primary ${compact ? 'text-lg' : 'text-xl'}`}>${task.budget}</span>
            </div>

            {/* Task Title and Description */}
            <h3 className={`font-semibold mb-1 line-clamp-1 ${compact ? 'text-base' : 'text-lg'}`}>{task.title}</h3>
            <p className={`text-sm text-gray-600 mb-3 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>{task.description}</p>

            {/* Category Badge - Hide in compact if needed, or keep smaller */}
            {!compact && (
                <Badge variant="secondary" className="mb-3">
                    {task.category}
                </Badge>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{task.location.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span className="text-xs">{task.offerCount} {task.offerCount === 1 ? 'offer' : 'offers'}</span>
                </div>
            </div>
        </div>
    );
}
