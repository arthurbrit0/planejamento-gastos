import React, { ReactNode } from 'react'

function layout({children}: {children: ReactNode}) { // criando layout para a pagina de config 
  return (
    <div className="relative p-5 flex h-screen w-full flex-col items-center justify-center">
      {children} {/* renderizando o conteudo do layout, que sera o arquivo page.tsx */}
    </div>
  )
}

export default layout
