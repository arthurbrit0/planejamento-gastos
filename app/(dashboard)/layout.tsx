import React, { ReactNode } from 'react'
import Navbar from '@/components/Navbar'

const layout = ({children}: {children: ReactNode}) => { // criando layout para o dashboard
  return (
    <div className="relative flex h-screen w-full flex-col">
        <Navbar /> {/* importando o componente Navbar */}
        <div className="w-full">
            {children} {/* renderizando o conteudo do layout, que sera o arquivo page.tsx */}
        </div>
    </div>
  )
}

export default layout