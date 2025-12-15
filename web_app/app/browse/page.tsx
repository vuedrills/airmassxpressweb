import { Suspense } from 'react';
import BrowsePageContent from '@/components/BrowsePageContent';

export const dynamic = 'force-dynamic';

export default function BrowsePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <BrowsePageContent />
        </Suspense>
    );
}
