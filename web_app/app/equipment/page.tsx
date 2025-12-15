import { Suspense } from 'react';
import EquipmentPageContent from '@/components/EquipmentPageContent';

export const dynamic = 'force-dynamic';

export default function EquipmentPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <EquipmentPageContent />
        </Suspense>
    );
}
