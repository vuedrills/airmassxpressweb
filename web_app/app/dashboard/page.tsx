'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/TaskCard';
import { fetchTasks, approveTaskerProfile, getCurrentUser } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Plus, List, MessageCircle, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvailabilityManager } from '@/components/AvailabilityManager';

export default function DashboardPage() {
    const router = useRouter();
    const { loggedInUser, login: setUser } = useStore(); // Alias login to setUser for clarity
    const [isApproving, setIsApproving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Fetch user's posted tasks
    const { data: myPostedTasks, isLoading: loadingPosted } = useQuery({
        queryKey: ['tasks', 'posted', loggedInUser?.id],
        queryFn: () => fetchTasks({ posterId: loggedInUser?.id }),
        enabled: !!loggedInUser?.id,
    });

    // Fetch tasks user has offered on
    const { data: myOfferedTasks, isLoading: loadingOffered } = useQuery({
        queryKey: ['tasks', 'offered', loggedInUser?.id],
        queryFn: () => fetchTasks({ offeredBy: loggedInUser?.id }),
        enabled: !!loggedInUser?.id,
    });

    const hasRefreshed = useRef(false);

    useEffect(() => {
        if (!loggedInUser) {
            router.push('/login');
            return;
        }

        // Refresh user data ONLY ONCE on mount
        if (!hasRefreshed.current) {
            hasRefreshed.current = true;
            const refreshUser = async () => {
                const freshUser = await getCurrentUser();
                if (freshUser) {
                    setUser(freshUser);
                }
            };
            refreshUser();
        }
    }, [loggedInUser, router, setUser]);

    const handleApproveProfile = async () => {
        if (!loggedInUser?.email) return;
        try {
            setIsApproving(true);
            await approveTaskerProfile(loggedInUser.email);
            // Refresh user data
            const updatedUser = await getCurrentUser();
            if (updatedUser) setUser(updatedUser);
            alert('Profile approved! Reloading...');
            window.location.reload();
        } catch (error) {
            console.error('Failed to approve', error);
            alert('Failed to approve profile.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleVerifyAccount = async () => {
        if (!loggedInUser?.id) return;
        try {
            setIsVerifying(true);
            // Call backend to verify account
            const response = await fetch(`http://localhost:8080/api/v1/admin/verify-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ user_id: loggedInUser.id })
            });

            if (response.ok) {
                const updatedUser = await getCurrentUser();
                if (updatedUser) setUser(updatedUser);
                alert('Account verified!');
                window.location.reload();
            } else {
                throw new Error('Verification failed');
            }
        } catch (error) {
            console.error('Failed to verify', error);
            alert('Failed to verify account.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (!loggedInUser) return null;

    // Calculate stats
    const postedCount = myPostedTasks?.length || 0;
    const offeredCount = myOfferedTasks?.length || 0;
    const offersReceived = myPostedTasks?.reduce((sum, task) => sum + (task.offerCount || 0), 0) || 0;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-1 py-8">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500 text-sm">Welcome back, {loggedInUser.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Dev Helper Actions */}
                            {!loggedInUser.isVerified && (
                                <Button
                                    variant="outline"
                                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                    onClick={handleVerifyAccount}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? 'Verifying...' : '⚡ Dev: Verify My Account'}
                                </Button>
                            )}

                            {loggedInUser.isTasker && loggedInUser.taskerProfile?.status === 'pending_review' && (
                                <Button
                                    variant="outline"
                                    className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                    onClick={handleApproveProfile}
                                    disabled={isApproving}
                                >
                                    {isApproving ? 'Approving...' : '⚡ Dev: Approve My Profile'}
                                </Button>
                            )}

                            <Button asChild>
                                <Link href="/post-task">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Post a Task
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid - Compact */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        <Card className="shadow-sm border-gray-200 py-3 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Posted</p>
                                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{postedCount}</h3>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-blue-50 rounded-lg">
                                    <List className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="shadow-sm border-gray-200 py-3 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Offers</p>
                                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{offersReceived}</h3>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-purple-50 rounded-lg">
                                    <MessageCircle className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="shadow-sm border-gray-200 py-3 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Offered</p>
                                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{offeredCount}</h3>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-orange-50 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 text-orange-600" />
                                </div>
                            </div>
                        </Card>

                        <Card className="shadow-sm border-gray-200 py-3 px-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Spent</p>
                                    <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">$0</h3>
                                </div>
                                <div className="h-8 w-8 flex items-center justify-center bg-green-50 rounded-lg">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Content Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Posted Tasks */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">My Posted Tasks</h2>
                                <Link href="/my-tasks" className="text-sm text-primary hover:underline">View All</Link>
                            </div>

                            {loadingPosted ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : myPostedTasks && myPostedTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {myPostedTasks.slice(0, 3).map(task => (
                                        <TaskCard key={task.id} task={task} compact />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-gray-500 mb-2">No active tasks</p>
                                    <Button variant="link" asChild className="px-0">
                                        <Link href="/post-task">Post your first task</Link>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Offered Tasks */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Tasks I've Offered On</h2>
                                <Link href="/my-offers" className="text-sm text-primary hover:underline">View All</Link>
                            </div>

                            {loadingOffered ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : myOfferedTasks && myOfferedTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {myOfferedTasks.slice(0, 3).map(task => (
                                        <TaskCard key={task.id} task={task} compact />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-gray-500 mb-2">No active offers</p>
                                    <Button variant="link" asChild className="px-0">
                                        <Link href="/browse">Browse tasks to earn</Link>
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Availability Manager (Taskers Only) - Full Width Section */}
                    {loggedInUser.isTasker && (
                        <div className="mt-12 max-w-2xl mx-auto">
                            <AvailabilityManager
                                initialAvailability={loggedInUser.taskerProfile?.availability}
                            />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
