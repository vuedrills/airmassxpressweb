'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTasks, fetchOffersByTask } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, DollarSign, Package, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Layout/Header';
import { NotificationBanner } from '@/components/NotificationBanner';

export default function MyTasksPage() {
    const loggedInUser = useStore((state) => state.loggedInUser);
    const currentNotification = useStore((state) => state.currentNotification);
    const dismissCurrentNotification = useStore((state) => state.dismissCurrentNotification);

    // Fetch all tasks
    const { data: allTasks = [], isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks({}),
    });

    // Fetch all offers to determine which tasks the user is working on
    const { data: allOffers = [] } = useQuery({
        queryKey: ['all-offers'],
        queryFn: async () => {
            // Fetch offers for all tasks
            const offerPromises = allTasks.map(task => fetchOffersByTask(task.id));
            const offersArrays = await Promise.all(offerPromises);
            return offersArrays.flat();
        },
        enabled: allTasks.length > 0,
    });

    if (!loggedInUser) {
        return (
            <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
                <Header />
                <main className="flex-1 py-6">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Please log in to view your tasks</h1>
                            <Link href="/login" className="text-primary hover:underline">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Tasks posted by the user
    const myPostedTasks = allTasks.filter(task => task.posterId === loggedInUser.id);

    // Tasks where user's offer was accepted (user is the tasker)
    // Find all offers made by this user
    const myOffers = allOffers.filter(offer => offer.taskerId === loggedInUser.id);
    // Find accepted offers
    const myAcceptedOffers = myOffers.filter(offer => offer.status === 'accepted');
    // Get the corresponding tasks
    const myAcceptedTasks = allTasks.filter(task =>
        myAcceptedOffers.some(offer => offer.taskId === task.id)
    );

    // Group posted tasks by status
    const openTasks = myPostedTasks.filter(t => t.status === 'open');
    const inProgressTasks = myPostedTasks.filter(t => t.status === 'in_progress');
    const completedTasks = myPostedTasks.filter(t => t.status === 'completed');
    const otherTasks = myPostedTasks.filter(t =>
        !['open', 'in_progress', 'completed'].includes(t.status)
    );

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            open: { label: 'OPEN', className: 'bg-green-100 text-green-800' },
            in_progress: { label: 'IN PROGRESS', className: 'bg-blue-100 text-blue-800' },
            revision_requested: { label: 'REVISION REQUESTED', className: 'bg-yellow-100 text-yellow-800' },
            completed: { label: 'COMPLETED', className: 'bg-gray-100 text-gray-800' },
            dispute: { label: 'DISPUTE', className: 'bg-red-100 text-red-800' },
        };
        const { label, className } = config[status] || { label: status.toUpperCase(), className: 'bg-gray-100 text-gray-800' };
        return <Badge className={`${className} hover:${className}`}>{label}</Badge>;
    };

    const TaskCard = ({ task }: { task: any }) => (
        <Link href={`/browse?taskId=${task.id}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-4">{task.title}</h3>
                    <div className="font-heading text-xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        ${task.budget}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location}</span>
                    </div>
                    {task.progress !== undefined && (
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Progress: {task.progress}%</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {getStatusBadge(task.status)}
                    {task.offerCount > 0 && (
                        <span className="text-sm text-gray-600">{task.offerCount} offers</span>
                    )}
                </div>
            </Card>
        </Link>
    );

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
            <NotificationBanner
                notification={currentNotification}
                onDismiss={dismissCurrentNotification}
            />
            <Header />

            <main className="flex-1 py-6">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="font-heading text-4xl font-bold mb-6 text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        My Tasks
                    </h1>

                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-8">
                            {/* Tasks You Posted */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Briefcase className="h-6 w-6 text-[#1a2847]" />
                                    <h2 className="text-2xl font-bold text-[#1a2847]">Tasks You Posted</h2>
                                </div>

                                {myPostedTasks.length === 0 ? (
                                    <Card className="p-8 text-center">
                                        <p className="text-gray-600 mb-4">You haven't posted any tasks yet</p>
                                        <Link href="/post-task" className="text-primary hover:underline">
                                            Post your first task
                                        </Link>
                                    </Card>
                                ) : (
                                    <div className="space-y-6">
                                        {/* In Progress Tasks - Needs Review */}
                                        {inProgressTasks.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3 text-blue-700">
                                                    🔵 In Progress ({inProgressTasks.length})
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {inProgressTasks.map(task => (
                                                        <TaskCard key={task.id} task={task} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2 italic">
                                                    💡 Click on tasks to update progress or review completed work
                                                </p>
                                            </div>
                                        )}

                                        {/* Open Tasks - Awaiting Offers */}
                                        {openTasks.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3 text-green-700">
                                                    🟢 Open - Awaiting Offers ({openTasks.length})
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {openTasks.map(task => (
                                                        <TaskCard key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Completed Tasks */}
                                        {completedTasks.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3 text-gray-700">
                                                    ✅ Completed ({completedTasks.length})
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {completedTasks.map(task => (
                                                        <TaskCard key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Other Statuses */}
                                        {otherTasks.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3">
                                                    Other Tasks ({otherTasks.length})
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    {otherTasks.map(task => (
                                                        <TaskCard key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Tasks You're Working On */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="h-6 w-6 text-[#1a2847]" />
                                    <h2 className="text-2xl font-bold text-[#1a2847]">Tasks You're Working On</h2>
                                </div>

                                {myAcceptedTasks.length === 0 ? (
                                    <Card className="p-8 text-center">
                                        <p className="text-gray-600 mb-4">You're not currently working on any tasks</p>
                                        <Link href="/browse" className="text-primary hover:underline">
                                            Browse available tasks
                                        </Link>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {myAcceptedTasks.map(task => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 mt-2 italic">
                                    💡 Click on tasks to update progress or mark complete when finished
                                </p>
                            </section>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
