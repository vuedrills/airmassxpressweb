'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
            {children}
        </WebSocketProvider>
    </QueryClientProvider>
    );
}
