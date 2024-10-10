"use client";

import { ThemeProvider } from 'next-themes'; // criando um provider de tema para o projeto
import React, { ReactNode } from 'react'

const RootProviders = ({children}: {children: ReactNode}) => {
  return (
    // setando modo de tema padrao para dark e habilitando o sistema para escolher o tema
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>{children}</ThemeProvider>
  )
}

export default RootProviders