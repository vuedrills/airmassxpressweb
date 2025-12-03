'use client';

import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchTaskById, fetchOffersByTask } from '@/lib/api';
import { MapPin, Calendar, DollarSign, CheckCircle, MessageCircle, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id as string;
    const { loggedInUser } = useStore();
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => fetchTaskById(taskId),
    });

    const { data: offers } = useQuery({
        queryKey: ['offers', taskId],
        queryFn: () => fetchOffersByTask(taskId),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading task...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
                        <p className="text-gray-600 mb-4">This task doesn't exist or has been removed.</p>
                        <Button asChild>
                            <Link href="/browse">Browse Tasks</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Task Header */}
                            <div className="bg-white rounded-lg border p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="secondary">{task.category}</Badge>
                                    <span className="text-3xl font-bold text-primary">${task.budget}</span>
                                </div>

                                <h1 className="text-3xl font-bold mb-4">{task.title}</h1>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{task.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {task.dateType === 'flexible'
                                                ? 'Flexible'
                                                : task.dateType === 'on_date'
                                                    ? `On ${new Date(task.date!).toLocaleDateString()}`
                                                    : `Before ${new Date(task.date!).toLocaleDateString()}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        <span>{task.offerCount} offers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Task Description */}
                            <div className="bg-white rounded-lg border p-6">
                                <h2 className="font-semibold text-lg mb-3">Task Description</h2>
                                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
                            </div>

                            {/* Offers Section */}
                            {offers && offers.length > 0 && (
                                <div className="bg-white rounded-lg border p-6">
                                    <h2 className="font-semibold text-lg mb-4">Offers ({offers.length})</h2>
                                    <div className="space-y-4">
                                        {offers.map((offer) => (
                                            <div key={offer.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={offer.tasker.avatar} />
                                                            <AvatarFallback>{offer.tasker.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{offer.tasker.name}</span>
                                                                {offer.tasker.isVerified && (
                                                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <span>{offer.tasker.rating.toFixed(1)}</span>
                                                                <span>({offer.tasker.reviewCount} reviews)</span>
                                                                <span className="ml-2">{offer.tasker.tasksCompleted} tasks completed</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-primary">${offer.amount}</div>
                                                        <Badge variant={offer.status === 'accepted' ? 'default' : 'secondary'} className="mt-1">
                                                            {offer.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 mb-2">{offer.description}</p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    {offer.estimatedDuration && <span>⏱️ {offer.estimatedDuration}</span>}
                                                    {offer.availability && <span>📅 {offer.availability}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Poster Card */}
                            <div className="bg-white rounded-lg border p-6 sticky top-20">
                                <h3 className="font-semibold mb-4">Posted By</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={task.poster?.avatar} />
                                        <AvatarFallback>{task.poster?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{task.poster?.name}</span>
                                            {task.poster?.isVerified && (
                                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span>{task.poster?.rating.toFixed(1)}</span>
                                            <span>({task.poster?.reviewCount})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Make Offer Button */}
                                {loggedInUser ? (
                                    <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full" size="lg">
                                                Make an Offer
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Make an Offer</DialogTitle>
                                            </DialogHeader>
                                            <form className="space-y-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Your Offer Amount (R)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter amount"
                                                        className="w-full border rounded-lg px-4 py-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Describe your offer</label>
                                                    <textarea
                                                        placeholder="Explain why you're the best person for this task..."
                                                        rows={4}
                                                        className="w-full border rounded-lg px-4 py-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Estimated Duration</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., 2-3 hours"
                                                        className="w-full border rounded-lg px-4 py-2"
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full">Submit Offer</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Button asChild className="w-full" size="lg">
                                        <Link href="/login">Log In to Make an Offer</Link>
                                    </Button>
                                )}

                                <Button variant="outline" className="w-full mt-3">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Ask a Question
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
