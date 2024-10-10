"use client";

import { ThemeProvider } from 'next-themes'; // criando um provider de tema para o projeto
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const RootProviders = ({children}: {children: ReactNode}) => {
  const [queryClient] = React.useState(()=> new QueryClient({}));
  return (
    <QueryClientProvider client={queryClient}>
      {/* setando modo de tema padrao para dark e habilitando o sistema para escolher o tema */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>{children}</ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default RootProviders