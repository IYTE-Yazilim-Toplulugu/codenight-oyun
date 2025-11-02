'use client';
import React from 'react';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {/* <AuthProvider> */}
            {children}
            <Toaster />
            {/* </AuthProvider> */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
