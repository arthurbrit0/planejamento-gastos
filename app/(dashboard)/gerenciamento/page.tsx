"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MoedaBox } from '@/components/MoedaBox'
import { TipoTransacao } from '@/lib/tipos'
import { useQuery } from '@tanstack/react-query'
import SkeletonWrapper from '@/components/SkeletonWrapper'
import { PlusSquare, TrendingDown, TrendingUp } from 'lucide-react'
import DialogoCriarCategoria from '../_components/DialogoCriarCategoria'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Categoria } from '@prisma/client'
import { TrashIcon } from 'lucide-react'
import DialogoDeletarCategoria from '../_components/DialogoDeletarCategoria'

function page() {
  return (
    <>
      <div className=" w-full justify-center mx-auto border-b bg-card">
        <div className="mx-auto container flex flex-wrap items-center justify-between gap-6 py-8">
          <div className="mx-auto text-center">
            <p className="text-3xl font-bold">Gerenciamento</p>
            <p className="text-muted-foreground">
              Gerencie as configurações do seu perfil e suas categorias!
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto container flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Moeda
            </CardTitle>
            <CardDescription>
              Altere a moeda padrão da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoedaBox />
          </CardContent>
        </Card>
        <ListaCategorias tipo="entrada" />
        <ListaCategorias tipo="saida" />
      </div>
    </>
  )
}

export default page

function ListaCategorias({ tipo }: { tipo: TipoTransacao }) {
  const categoriasQuery = useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      const response = await fetch(`/api/categorias?tipo=${tipo}`)
      const data = response.json();
      return data;
    }
  })

  const dadosDisponiveis = categoriasQuery.data?.length > 0;

  return (
    <SkeletonWrapper isLoading={categoriasQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {tipo === "entrada" ? <TrendingUp className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500"/> : 
              <TrendingDown className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500"/>}
              <div>
                {tipo === "entrada" ? "Categorias de Entrada" : "Categorias de Saída"}
                <div className="text-sm text-muted-foreground">
                  Ordenadas por nome
                </div>
              </div>
            </div>
            <DialogoCriarCategoria 
              tipo={tipo} 
              onSuccessCallback={() => categoriasQuery.refetch()}
              trigger={
                <Button variant="ghost" className="flex border-separate items-center justify-start border-b px-3 py-3 text-muted-foreground">
                  <PlusSquare className="h-4 w-4" />
                   Criar Cateogria
                </Button>
              }

            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {
          !dadosDisponiveis && (
            <div className="flex h-40 w-full flex-col items-center justify-center">
              <p>
                Sem categorias disponíveis
              </p>
              <p className="text-sm text-muted-foreground">
                Tente criar uma!
              </p>
            </div>
          )
        }

        {
          dadosDisponiveis && (
            <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg-grid-cols-4">
              {categoriasQuery.data.map((categoria: Categoria) => {
                return <CardCategoria categoria={categoria} key={categoria.nome} />
              })}
            </div>
          )
        }

      </Card>
    </SkeletonWrapper>
  )
}

function CardCategoria ({categoria}: {categoria: Categoria}) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl" role="img">{categoria.icone}</span>
        <span>{categoria.nome}</span>
      </div>
      <DialogoDeletarCategoria categoria={categoria} trigger={
              <Button className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20" variant={"secondary"}>
                <TrashIcon className="w-4 h-4"/> Remover
              </Button>
      }/>
    </div>
  )
}