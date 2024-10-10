"use client"
import React from 'react'
import Logo from './Logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'

const Navbar = () => {
  return (
    <>
        <DesktopNavbar />
    </>
  )
}

const items = [
    {label: "Dashboard", link: "/"}, 
    {label: "Transações", link: "/transacoes"},
    {label: "Gerenciamento", link: "/gerenciamento"},
]

function DesktopNavbar() {
    return (
        <div className="hidden border-separte border-b bg-background md:block">
            <nav className="container flex items-center justify-between px-8">
                <div className="flex h-[80px] min-h-[60px] items-center justify-center gap-x-4">
                    <Logo /> {/* passando o componente Logo para o Navbar */}
                    <div className="flex h-full"> {/* Para cada rota da aplicação, criaremos um item na navbar com o nome do rota e um link para ela */}
                        {items.map(item => (
                            <NavbarItem label={item.label} link={item.link} />
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}

// como esse componente NavbarItem só será usado dentro do componente, ele vai ser declarado aqui mesmo, sem ser na pasta components
function NavbarItem({link, label}: {link: string, label: string}) { // criando um componente para os itens do menu
    const pathname = usePathname(); // pegando o pathname atual
    const isActive = pathname === link; // se o link estiver ativo, isActive será true

    return (
        <div className="relative items-center">
            <Link href={link} className={cn( // usando a função cn para adicionar classes condicionais (isActive)
                buttonVariants({variant:"ghost"}), "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
                isActive && "text-foreground")}>
                    {label}
            </Link> {/* passando o link do item da Navbar para o componente Link */}
        </div>
    )
}

export default Navbar