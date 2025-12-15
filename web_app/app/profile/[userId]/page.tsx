
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { fetchUserProfile } from '@/lib/api';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { User } from '@/types';

interface ProfilePageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { userId } = await params;
    const user = await fetchUserProfile(userId);

    // If user not found
    if (!user) {
        return (
            <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: '#f3f3f7' }}>
                <Header />
                <main className="flex-1 py-6">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                            <p className="text-gray-600 mb-6">The user you are looking for does not exist or has been removed.</p>
                            <Link href="/">
                                <Button>Return to Home</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Map Reviews to ensure they have all fields expected by ProfileContent
    // The backend returns reviews in user.reviews_received. We map them here.
    const reviews = (user.reviews_received || []).map((r: any) => ({
        id: r.id,
        reviewerName: r.reviewer?.name || 'Anonymous',
        reviewerAvatar: r.reviewer?.avatar_url || r.reviewer?.avatar || '/avatars/default.png',
        rating: r.rating || 5, // Access directly if float, or calculate
        rating_communication: r.rating_communication || r.rating || 5,
        rating_time: r.rating_time || r.rating || 5,
        rating_professionalism: r.rating_professionalism || r.rating || 5,
        comment: r.comment || '',
        reply: r.reply || '',
        replyCreatedAt: r.reply_created_at ? new Date(r.reply_created_at).toLocaleDateString() : undefined,
        timeAgo: new Date(r.created_at).toLocaleDateString(), // We can improve this in ProfileContent if we pass raw date
        taskDescription: r.task?.title || r.linkTask?.title || 'Task', // Try to get task title if included
    }));

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: '#f3f3f7' }}>
            <Header />
            <main className="flex-1 py-6">
                <div className="container mx-auto px-4 max-w-6xl">
                    <Link href="/browse" className="inline-flex items-center gap-2 text-gray-700 hover:text-primary mb-6 text-sm font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to browse
                    </Link>

                    <ProfileContent user={user} reviews={reviews} />
                </div>
            </main>
        </div>
    );
}
