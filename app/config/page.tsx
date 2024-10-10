import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { MoedaBox } from '@/components/MoedaBox';

const page = async () => { // aqui a função é async pois iremos utilizar a função currentUser do clerk para verificar se o usuário está autenticado
  

  const user = await currentUser();
  if (!user) {
    redirect('/login') // se o usuário não estiver autenticado, vai ser redirecionado para a página de login
  }

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
        <div>
            <h1 className="text-center text-3xl">
                Bem-vindo, <span className="ml2 font-bold">{user.firstName}!</span>
            </h1>
            <h2 className="mt-4 text-center text-base text-muted-foreground">
                Vamos começar a planejar seus gastos? Escolha sua moeda!
            </h2>
            <h3 className="mt-2 text-center text-sm text-muted-foreground">
                Você pode mudar essas configurações a qualquer momento.
            </h3>
        </div>
        <Separator />
        <Card className="w-full"> {/* importando o componente Card para criar um card de escolha de moeda */}
            <CardHeader> {/* importando o componente CardHeader para criar o cabeçalho do card, junto com titulo e descrição */}
                <CardTitle>Moeda</CardTitle>
                <CardDescription>Defina sua moeda para fazer transações.</CardDescription>
            </CardHeader>
            <CardContent>
                <MoedaBox /> {/* O conteúdo do card será o componente MoedaBox, que é um dropdown de escolha de moedas */}
            </CardContent>
        </Card>
        <Separator />
        <Button className="w-full" asChild>
            <Link href="/dashboard">Ir para o dashboard</Link>
        </Button>
        <div className="mt-8">
            <Logo />
        </div>
    </div>
  )
}

export default page