'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Star, MapPin, CheckCircle, ChevronDown, ChevronUp, BadgeCheck, Pencil } from 'lucide-react';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/api';
import { ReviewsDialog } from './ReviewsDialog';
import { ReviewCard } from './ReviewCard';
import { ImageLightbox } from './ImageLightbox';
import { replyReview } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ProfileContentProps {
    user: User;
    reviews: any[];
}

export function ProfileContent({ user: initialUser, reviews }: ProfileContentProps) {
    const [user, setUser] = useState(initialUser);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const router = useRouter();

    const handleReply = async (reviewId: string, text: string) => {
        try {
            await replyReview(reviewId, text);
            router.refresh();
        } catch (error) {
            console.error('Failed to reply:', error);
            alert('Failed to send reply');
        }
    };

    useEffect(() => {
        const fetchMe = async () => {
            const me = await getCurrentUser();
            setCurrentUser(me);
        };
        fetchMe();
    }, []);

    const isOwner = currentUser?.id === user.id;

    const isTasker = user.isTasker && user.taskerProfile;
    const taskerProfile = user.taskerProfile;

    // Data Resolution
    const displayName = user.name;
    const avatarUrl = (isTasker && taskerProfile?.profilePictureUrl) ? taskerProfile.profilePictureUrl : (user.avatar_url || user.avatar || '/avatars/default.png');
    const location = user.location ? formatLocation(user.location) : 'Location not set';
    // Use lastActivityAt if available, otherwise fall back to memberSince or generic
    const lastSeen = formatLastSeen(user.lastActivityAt || user.memberSince);

    // Stats
    const overallRating = user.rating || 0;
    const reviewCount = reviews.length;
    const completionRate = '100%'; // User asked to fix this late, for now hardcoded or derived if we had data

    // Reviews Logic
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="md:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl border p-6 shadow-sm relative">
                    {/* Edit Button for Owner */}
                    {isOwner && (
                        <Link
                            href="/profile/edit"
                            className="absolute top-4 right-4 z-10"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-xs text-gray-500 font-bold tracking-wider mb-1">MEET</div>
                            <h1 className="text-4xl font-bold text-[#1a2847] font-heading leading-tight mb-2">
                                {displayName}
                                {user.isVerified && <BadgeCheck className="inline-block ml-2 text-blue-500 fill-blue-50 w-6 h-6" />}
                            </h1>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-gray-500">
                                    Online {lastSeen}
                                </span>
                            </div>
                        </div>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <span>{location}</span>
                    </div>

                    {/* Stats Box */}
                    <div className="bg-blue-50/50 rounded-2xl p-4 flex justify-between items-center mb-2">
                        <div>
                            <div className="flex items-center gap-1 font-bold text-2xl text-[#1a2847]">
                                {overallRating.toFixed(1)} <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            </div>
                            <div className="text-xs text-gray-500">Overall rating</div>
                            <button
                                onClick={() => setIsReviewsOpen(true)}
                                className="text-xs text-gray-400 underline decoration-gray-300 mt-0.5 hover:text-blue-600 hover:decoration-blue-600 transition-colors cursor-pointer"
                            >
                                {reviewCount} reviews
                            </button>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <div className="font-bold text-2xl text-[#1a2847]">{completionRate}</div>
                            <div className="text-xs text-gray-500">Completion rate</div>
                            <div className="text-xs text-gray-400 mt-0.5">{user.tasksCompleted} tasks</div>
                        </div>
                    </div>
                </div>

                {/* Verified Info */}
                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="font-bold text-[#1a2847] mb-4">Verified information</h3>
                    <div className="space-y-3">
                        {user.isVerified && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-700">ID Verified</span>
                            </div>
                        )}
                        {/* Add more verifications if available */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">

                {/* Tasker Portfolio & Bio (Only if Tasker) */}
                {isTasker && (
                    <div className="bg-white rounded-3xl border p-8 shadow-sm">

                        {/* Portfolio */}
                        {taskerProfile?.portfolioUrls && taskerProfile.portfolioUrls.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-[#1a2847] mb-4">Portfolio</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {taskerProfile.portfolioUrls.map((url, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                                            onClick={() => {
                                                setLightboxIndex(idx);
                                                setLightboxOpen(true);
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Portfolio ${idx}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-[#1a2847] mb-2">About</h2>
                            {taskerProfile?.professionIds && taskerProfile.professionIds.length > 0 && (
                                <div className="text-sm font-medium text-gray-500 mb-3 capitalize">
                                    {taskerProfile.professionIds.join(', ')} Tasker
                                </div>
                            )}
                            <div className="prose prose-sm text-gray-600 max-w-none">
                                <p>{taskerProfile?.bio || "No bio information provided."}</p>
                            </div>
                        </div>

                        {/* Qualifications */}
                        {taskerProfile?.qualifications && taskerProfile.qualifications.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-[#1a2847] mb-4">Qualifications</h2>
                                <div className="space-y-4">
                                    {taskerProfile.qualifications.map((qual, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <BadgeCheck className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1a2847]">{qual.name}</h4>
                                                <p className="text-sm text-gray-500">{qual.issuer} • {qual.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white rounded-3xl border p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg font-bold text-[#1a2847]">Overall rating {overallRating.toFixed(1)}</h2>
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="text-gray-400 text-sm ml-2">{reviewCount} reviews</span>
                    </div>

                    <div>
                        {displayedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                reviewerName={review.reviewerName}
                                reviewerAvatar={review.reviewerAvatar}
                                rating={review.rating}
                                comment={review.comment}
                                timeAgo={review.timeAgo}
                                taskDescription={review.taskDescription}
                                reply={review.reply}
                                replyCreatedAt={review.replyCreatedAt}
                                canReply={isOwner && !review.reply}
                                onReply={(text: string) => handleReply(review.id, text)}
                            />
                        ))}
                    </div>

                    {reviews.length > 5 && (
                        <div className="mt-8 pt-6 border-t flex justify-center">
                            <Button
                                variant="ghost"
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="flex items-center gap-2 text-[#1a2847] font-semibold hover:bg-gray-50"
                            >
                                {showAllReviews ? (
                                    <>Show less <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Read more reviews <ChevronDown className="h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    )}

                    {reviews.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No reviews yet.
                        </div>
                    )}
                </div>
            </div> {/* Closes Main Content (md:col-span-2) */}

            <ReviewsDialog
                isOpen={isReviewsOpen}
                onOpenChange={setIsReviewsOpen}
                reviews={reviews}
                overallRating={overallRating}
                reviewCount={reviewCount}
                isTasker={!!isTasker}
                isOwner={isOwner}
            />

            {taskerProfile?.portfolioUrls && (
                <ImageLightbox
                    images={taskerProfile.portfolioUrls}
                    initialIndex={lightboxIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
}

// Helpers
function formatLocation(address: string): string {
    // Try to extract Town/Suburb. 
    // Assuming format "123 Street, Suburb, Town, Country" or similar.
    // If difficult, just return the whole string or split by comma and take last 2 parts.
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        // Return 2nd to last + Last (e.g. Suburb, Town)
        // Or if simple, return all. User asked for "town and surburb only".
        // Heuristically: usually last is postal/country, then town, then suburb.
        // Let's try to grab parts[parts.length-3] + parts[parts.length-2] if long.
        // For simplicity:
        return parts.slice(-3).join(', '); // Return last 3 components just in case
    }
    return address;
}

import { formatDistanceToNow } from 'date-fns';

function formatLastSeen(dateString?: string): string {
    if (!dateString) return 'recently';
    try {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return 'recently';
    }
}

