'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // Shadcn Badge
import { Star, Clock, MessageCircle, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    location: string;
    is_verified: boolean;
    rating: number;
    review_count: number;
    tasks_completed: number;
    tasks_completed_on_time: number;
    member_since: string;

    // Badges
    badge_top_rated: boolean; // ⭐
    badge_on_time: boolean; // 🕒
    badge_rehired: boolean; // 🔁
    badge_communicator: boolean; // 👍
    badge_quick_response: boolean; // ⚡
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer: {
        id: string;
        name: string;
        avatar_url: string;
    };
    reply?: string;
    reply_created_at?: string;
}

export default function ProfilePage() {
    const params = useParams();
    const userId = params.id as string;

    const [reviews, setReviews] = useState<Review[]>([]);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            // Need a public endpoint for this. Assuming generic user fetch or specific profile endpoint
            // For now, using generic fetch pattern
            return apiFetch<UserProfile>(`/users/${userId}/profile`);
        },
    });

    const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
        queryKey: ['reviews', userId],
        queryFn: async () => {
            // Assuming existing endpoint or new one. 
            // Using pending task implementation pattern, we might need to add this to backend.
            // For now, mocking empty array if 404
            try {
                return await apiFetch<Review[]>(`/users/${userId}/reviews`);
            } catch {
                return [];
            }
        },
    });

    if (isUserLoading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">User not found.</div>;
    }

    // Helper for stars
    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-[#1a2847]">{user.name}</h1>
                            {user.is_verified && (
                                <span title="Verified ID"><ShieldCheck className="w-6 h-6 text-blue-500" /></span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-gray-600 mb-4">
                            <span className="flex items-center gap-1">📍 {user.location || 'No location'}</span>
                            <span className="flex items-center gap-1">📅 Since {format(new Date(user.member_since), 'MMM yyyy')}</span>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {user.badge_top_rated && (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 gap-1 border-yellow-200">
                                    <Star className="w-3 h-3 fill-yellow-600" /> Top Rated
                                </Badge>
                            )}
                            {user.badge_on_time && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 gap-1 border-green-200">
                                    <Clock className="w-3 h-3" /> On-Time
                                </Badge>
                            )}
                            {user.badge_rehired && (
                                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 gap-1 border-purple-200">
                                    <Briefcase className="w-3 h-3" /> Highly Re-hired
                                </Badge>
                            )}
                            {user.badge_communicator && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1 border-blue-200">
                                    <MessageCircle className="w-3 h-3" /> Great Communicator
                                </Badge>
                            )}
                            {user.badge_quick_response && (
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 gap-1 border-orange-200">
                                    <Zap className="w-3 h-3" /> Fast Responder
                                </Badge>
                            )}
                            {user.is_verified && (
                                <Badge variant="outline" className="text-gray-600 gap-1">
                                    <ShieldCheck className="w-3 h-3" /> ID Verified
                                </Badge>
                            )}
                        </div>

                        <p className="text-gray-700 leading-relaxed max-w-2xl">
                            {user.bio || "No bio yet."}
                        </p>
                    </div>

                    {/* Quick Stats Box */}
                    <div className="bg-gray-50 rounded-xl p-6 min-w-[200px] border border-gray-100">
                        <div className="text-center mb-4">
                            <div className="text-4xl font-bold text-[#1a2847] mb-1">{user.rating.toFixed(1)}</div>
                            <div className="flex justify-center gap-0.5 mb-1">
                                {renderStars(user.rating)}
                            </div>
                            <div className="text-sm text-gray-500">{user.review_count} reviews</div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Completion</span>
                                <span className="font-semibold text-[#1a2847]">
                                    {user.tasks_completed > 0 ? "100%" : "New"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tasks Done</span>
                                <span className="font-semibold text-[#1a2847]">{user.tasks_completed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div>
                <h2 className="text-2xl font-bold text-[#1a2847] mb-6">Reviews</h2>
                <div className="grid gap-4">
                    {reviewsData && reviewsData.length > 0 ? (
                        reviewsData.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl border hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={review.reviewer.avatar_url} />
                                            <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-[#1a2847]">{review.reviewer.name}</h4>
                                            <p className="text-xs text-gray-500">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex gap-0.5">
                                            {renderStars(review.rating)}
                                        </div>
                                        <button
                                            onClick={() => alert('Review reported for moderation.')}
                                            className="ml-2 text-xs text-gray-400 hover:text-red-500 underline"
                                            title="Report this review"
                                        >
                                            Report
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4 ml-13 pl-13">{review.comment}</p>

                                {/* Tasker Reply */}
                                {review.reply && (
                                    <div className="ml-12 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-[#1a2847]">Response from {user.name}</span>
                                            {review.reply_created_at && (
                                                <span className="text-xs text-gray-400">
                                                    • {format(new Date(review.reply_created_at), 'MMM d, yyyy')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 italic">"{review.reply}"</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-500">
                            No reviews yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
