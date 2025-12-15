import { Suspense } from 'react';
import MessagesPageContent from '@/components/MessagesPageContent';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <MessagesPageContent />
        </Suspense>
    );
}
