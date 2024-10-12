import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import DialogoCriarTransacao from './_components/DialogoCriarTransacao';
import Overview from './_components/Overview';
import Historico from './_components/Historico';

const page = async () => {
  const usuarioAtual = await currentUser(); // pegamos as informações do usuario logado

  if (!usuarioAtual) {
    redirect('/login') // se o usuario não estiver logado, o redirecionamos para a página de login
  }

  const configuracoesUsuario = await prisma.configuracoesUser.findUnique({ // acharemos um usuario no banco de dados com o id do usuario logado e retornaremos suas configuracoes (id e moeda)
    where: {
      userId: usuarioAtual.id,
    },
  });

  if (!configuracoesUsuario) { // se ele não tiver uma configuração, sera redirecionado para a página de configuração
    redirect('/config')
  }

  return (
    <div className="h-full bg-background px-10">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-center gap-6 py-8 mx-auto">
          <p className="text-3xl font-bold">
            Olá, {usuarioAtual.firstName}! 
          </p>
          <div className="flex items-center gap-3">
          <DialogoCriarTransacao trigger={// criamos um dialogo para criar uma transacao, passando trigger e tipo como props
            <Button variant={"outline"} // o trigger, nesse caso, será um botão
            className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white">
              Nova entrada
            </Button>}
            tipo="entrada" // e o tipo será uma entrada. esses dados serão tratados no componente DialogoCriarTransacao
            />

            <DialogoCriarTransacao trigger={ // já aqui, o trigger é outro botão, mas dessa vez de saídas
              <Button variant={"outline"} 
              className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white">
                Nova saída
              </Button>
            }
            tipo="saida" // e o tipo é saída. esses dados serão tratados no componente DialogoCriarTransacao.
            />

          </div>
        </div>
      </div>
      <Overview configuracoesUser={configuracoesUsuario} />
      <div className="container mx-auto">
        <Historico configuracoesUser={configuracoesUsuario} /> 
      </div>
    </div>
  )
}

export default page