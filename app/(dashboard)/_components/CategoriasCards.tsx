"use client";

import { ConfiguracoesUser } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react'
import { DataToUTCDate, GetFormatterMoeda } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { TipoTransacao } from '@/lib/tipos';
import { GetCategoriasResponseType } from '@/app/api/estatisticas/categorias/route';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface Props {
    configuracoesUser: ConfiguracoesUser;                                   // definindo os tipos dos props do componente CategoriasCards
    from: Date;
    to: Date;
}

function CategoriasCards({configuracoesUser, from, to}: Props ) {

    const queryCategorias = useQuery<GetCategoriasResponseType>({           // fazemos uma consulta ao banco de dados, que retornará um objeto com as categorias do usuario e seus valores
        queryKey: ['overview','estatisticas','categorias', from, to],       // usamos essa queryKey para, quando o range de datas for alterado, ou quando criarmos uma nova transacao, ocorra um refetch nessa query
        queryFn: () => {
            return fetch(`/api/estatisticas/categorias?from=${DataToUTCDate(from)}&to=${DataToUTCDate(to)}`)   // fazemos uma chamada get a api para pegar as categorias do usuario no range de data
            .then((res) => res.json())
        }
    })

    const formatter = useMemo(() => {                                       // usando o hook useMemo para memorizar o valor do GetFormatterMoeda com o parâmetro da moeda do usuario
        return GetFormatterMoeda(configuracoesUser.moeda)
    }, [configuracoesUser.moeda]);                                          // a função só vai ser refeita quando a moeda do usuário for alterada

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={queryCategorias.isFetching}>
        <CategoriasCard formatter={formatter} tipo="entrada" data={queryCategorias.data || []}/> {/* retornamos um card de categorias, passando o tipo de transação, os dados e o formatter da moeda como props */}
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={queryCategorias.isFetching}>
        <CategoriasCard formatter={formatter} tipo="saida" data={queryCategorias.data || []}/> {/* retornamos um card de categorias, passando o tipo de transação, os dados e o formatter da moeda como props */}
      </SkeletonWrapper>
    </div>
  )
}

export default CategoriasCards

function CategoriasCard({formatter, tipo, data}: {                          // criamos um componente CategoriasCard, que recebe o formatter da moeda, o tipo de transação e os dados como props
    formatter: Intl.NumberFormat,
    tipo: TipoTransacao, 
    data: GetCategoriasResponseType,
}) {

    const dadosFiltrados = data.filter((dado) => dado.tipo === tipo);       // filtramos os dados, pegando apenas os dados que tem o tipo de transação igual ao tipo passado como prop
    const total = dadosFiltrados.reduce((acc, curr) => acc + (curr?._sum.valor || 0), 0);  // somamos os valores dos dados filtrados, para pegar o valor total de transações. esse total será usando para calcualr o percentual de cada categoria


    return (
        <Card className="w-full h-80 col-span-6">
            <CardHeader>
                <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
                    {tipo === "entrada" ? "Entradas" : "Saídas"}
                </CardTitle>
            </CardHeader>

            <div className="flex- items-center justify-between gap-2">
                {dadosFiltrados.length === 0 && (
                    <div className="flex h-60 flex-col items-center justify-center">
                        Não há dados no período selecionado!
                        <p className="text-sm text-muted-foreground">Tente selecionar outro período!</p>
                    </div>
                )}

                {dadosFiltrados.length > 0 && (
                    <ScrollArea className="h-60 w-full px-4">
                        <div className="flex w-full flex-col gap-4 p-4">
                            {dadosFiltrados.map(item => {
                                const valor = item._sum.valor || 0; // pegamos o valor total de transações de cada categoria
                                const percentual = (valor * 100) / (total || valor ); // calculamos o percentual de cada categoria, baseado no valor total
                                return (
                                    <div key={item.categoria} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center text-gray-400">
                                                {item.iconeCategoria} {item.categoria}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({percentual.toFixed(0)}%)
                                                </span>
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {formatter.format(valor)}
                                            </span>
                                        </div>
                                        <Progress value={percentual} indicator={tipo === "entrada" ? "bg-emerald-500" : "bg-rose-500"} />
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </Card>
    )
}

