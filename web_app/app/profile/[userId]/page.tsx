'use client';

import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { getProfileData } from '@/data/profile-data';

interface ProfilePageProps {
    params: {
        userId: string;
    };
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const profile = getProfileData(params.userId);

    if (!profile) {
        return (
            <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
                <Header />
                <main className="flex-1 py-6">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                            <Link href="/browse">
                                <Button>Return to Browse</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f3f3f7' }}>
            <Header />
            <main className="flex-1 py-6">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href="/browse" className="inline-flex items-center gap-2 text-gray-700 hover:text-primary mb-6 text-sm">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-lg border p-6 mb-4">
                                <div className="text-xs text-gray-600 mb-2">MEET</div>
                                <h1 className="font-heading text-4xl font-bold mb-3 text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                    {profile.name}
                                </h1>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span className="text-sm text-gray-600">
                                        {profile.isOnline ? 'Online now' : `Online ${profile.lastOnline}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                    <MapPin className="h-4 w-4" />
                                    <span>{profile.location}</span>
                                </div>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 mx-auto">
                                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg border p-4 mb-4">
                                <div className="text-3xl font-bold text-[#1a2847] flex items-center gap-1 font-heading" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                                    {profile.overallRating} <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Overall rating</div>
                                <div className="text-xs text-gray-500 mt-1">{profile.reviewCount} reviews</div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <div className="bg-white rounded-lg border p-6">
                                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                                <div className="space-y-6">
                                    {profile.reviews.map((review) => (
                                        <div key={review.id} className="pb-6 border-b last:border-b-0">
                                            <div className="flex items-start gap-3 mb-3">
                                                <img src={review.reviewerAvatar} alt={review.reviewerName} className="w-10 h-10 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm">{review.reviewerName}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                        ))}
                                                        <span className="text-xs text-gray-500 ml-2">{review.timeAgo}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                                            <p className="text-xs text-gray-500">{review.taskDescription}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
