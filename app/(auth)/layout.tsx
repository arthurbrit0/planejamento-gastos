import Logo from '@/components/Logo'
import React, {ReactNode} from 'react'

const layout = ({children}: {children: ReactNode}) => { // criando o layout base para as paginas de login e registro
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <Logo /> {/* passando o componente logo para as paginas de autenticacao */}
        <div className="mt-12">
            {children}
        </div>
    </div>
  )
}

export default layout