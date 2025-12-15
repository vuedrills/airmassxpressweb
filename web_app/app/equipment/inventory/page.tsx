import { Suspense } from 'react';
import InventoryManagement from '@/components/InventoryManagement';

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <InventoryManagement />
        </Suspense>
    );
}
