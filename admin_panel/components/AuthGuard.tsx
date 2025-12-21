'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token && pathname !== '/login') {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    if (!authorized && pathname !== '/login') {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}
