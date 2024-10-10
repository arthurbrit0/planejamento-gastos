import React from 'react'
import { PiggyBank } from 'lucide-react' // importando ícone de porco do lucide-react para usar na logo

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
        <PiggyBank className="stroke h-11 w-11 stroke-amber-500 stroke-[1.5]" />
        <p className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-3xl font-bold 
        leading-tight tracking-tighter text-transparent">Planejamento de gastos</p> {/* retornando a logo, com o ícone de porco e texto */}
    </a>
  )
}

export function LogoMobile() {
  return (
    <a href="/" className="flex items-center gap-2">
        <p className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-3xl font-bold 
        leading-tight tracking-tighter text-transparent items-center justify-center">Planejamento de gastos</p> {/* retornando a logo para mobile, com o ícone de porco e texto */}
    </a> 
  )
}

export default Logo