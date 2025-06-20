'use client';

import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

export const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
