'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { fetchTasks } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, List, MessageCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const { loggedInUser } = useStore();

    const { data: allTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks({}),
    });

    if (!loggedInUser) {
        router.push('/login');
        return null;
    }

    // Mock: filter tasks posted by current user
    const myPostedTasks = allTasks?.filter((t) => t.posterId === loggedInUser.id) || [];
    const myOfferedTasks = allTasks?.slice(0, 3) || [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <p className="text-gray-600">Manage your tasks and offers</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Posted Tasks</p>
                                    <p className="text-2xl font-bold">{myPostedTasks.length}</p>
                                </div>
                                <List className="h-8 w-8 text-primary" />
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Offers Received</p>
                                    <p className="text-2xl font-bold">
                                        {myPostedTasks.reduce((sum, task) => sum + task.offerCount, 0)}
                                    </p>
                                </div>
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Tasks Offered On</p>
                                    <p className="text-2xl font-bold">{myOfferedTasks.length}</p>
                                </div>
                                <MessageCircle className="h-8 w-8 text-accent" />
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold">$0</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Button asChild size="lg" className="h-20">
                            <Link href="/post-task">
                                <Plus className="h-5 w-5 mr-2" />
                                Post a New Task
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-20">
                            <Link href="/browse">
                                <List className="h-5 w-5 mr-2" />
                                Browse Tasks
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-20">
                            <Link href="/messages">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Messages
                            </Link>
                        </Button>
                    </div>

                    {/* My Posted Tasks */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">My Posted Tasks</h2>
                        {myPostedTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myPostedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border rounded-lg p-12 text-center">
                                <p className="text-gray-600 mb-4">You haven't posted any tasks yet</p>
                                <Button asChild>
                                    <Link href="/post-task">Post Your First Task</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tasks I've Offered On */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Tasks I've Offered On</h2>
                        {myOfferedTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myOfferedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border rounded-lg p-12 text-center">
                                <p className="text-gray-600 mb-4">You haven't made any offers yet</p>
                                <Button asChild>
                                    <Link href="/browse">Browse Tasks</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
