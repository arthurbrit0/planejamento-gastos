"use client"
import React, { useState } from 'react'
import Logo, {LogoMobile} from './Logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'
import { ThemeSwitcherBtn } from './ThemeSwitcherBtn'
import { Button, buttonVariants } from './ui/button'
import { Menu } from 'lucide-react'
import { SheetContent, SheetTrigger, Sheet } from './ui/sheet'

const Navbar = () => {
  return (
    <>
        <DesktopNavbar /> {/* definindo versão da navbar para desktop e mobile */}
        <MobileNavbar />
    </>
  )
}

const items = [ // criando os itens da navbar, adicionando rotas e labels para cada um
    {label: "Dashboard", link: "/"}, 
    {label: "Transações", link: "/transacoes"},
    {label: "Gerenciamento", link: "/gerenciamento"},
]

function DesktopNavbar() { // função para navbar de desktop, que ficará hidden até o breakpoint md
    return (
        <div className="hidden border-separte border-b bg-background md:block">
            <nav className="mx-auto container flex items-center justify-between px-8">
                <div className="mx-auto flex h-[80px] min-h-[60px] items-center justify-center gap-x-10">
                    <Logo /> {/* passando o componente Logo para o Navbar */}
                    <div className="flex"> {/* Para cada rota da aplicação, criaremos um item na navbar com o nome do rota e um link para ela */}
                        {items.map(item => (
                            <NavbarItem key={item.label} label={item.label} link={item.link} />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcherBtn /> {/* passando o componente de botão para mudar o tema e o UserButton do clerk para logout */}
                    <UserButton/>
                </div>
            </nav>
        </div>
    )
}

function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false); // criando um estado para controlar se o menu está aberto ou fechado

    return (
        <div className="block border-separate bg-background md:hidden"> {/* A navbar para mobile ficará escondida a partir do breakpoint md */}
            <nav className="container flex items-center justify-between px-8">
                <Sheet open={isOpen} onOpenChange={setIsOpen}> {/* usando o componente sheet para o menu lateral -> quando aberto, chamará a função setIsOpen */}
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]" side="left">
                        <Logo />
                        <div className="flex flex-col gap-1 pt-4"> 
                            {items.map(item => ( // quando o menu for aberto, isOpen mudará de estado para o estado oposto (se for aberta, sairá de falso para verdadeiro)
                                <NavbarItem key={item.label} label={item.label} link={item.link} onClick={() => setIsOpen((prev)=> !prev)}/> 
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
                    <LogoMobile />
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitcherBtn />
                    <UserButton />
                </div>
            </nav>
        </div>
    )
}

// como esse componente NavbarItem só será usado dentro do componente, ele vai ser declarado aqui mesmo, sem ser na pasta components
function NavbarItem({link, label, onClick}: {link: string, label: string, onClick? : () => void}) { // criando um componente para os itens do menu
    const url = usePathname(); // pegando o pathname atual
    const isActive = url === link; // se o link estiver ativo, isActive será true

    return (
        <div className="relative items-center">
            <Link href={link} className={cn( // usando a função cn para adicionar classes condicionais (isActive)
                buttonVariants({variant:"ghost"}), "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
                isActive && "text-foreground")}
                onClick={()=> {
                    if(onClick) onClick();
                }}>
                    {label}
            </Link> {/* passando o link do item da Navbar para o componente Link */}
            {isActive && (
                <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"/>
            )}
        </div>
    )
}

export default Navbar