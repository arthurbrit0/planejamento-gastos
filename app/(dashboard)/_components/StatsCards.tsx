"use client";

import { GetSaldoResponseType } from '@/app/api/estatisticas/saldo/route';
import { DataToUTCDate } from '@/lib/helpers';
import { ConfiguracoesUser } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import React, { ReactNode, useCallback, useMemo } from 'react'
import { GetFormatterMoeda } from '@/lib/helpers';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { EqualIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from 'react-countup';

interface Props { // definindo os tipos dos props do componente StatsCards
    from: Date,   // receberemos o range de data e as configurações do usuário, para definir a moeda que será mostrada nos cards
    to: Date,
    configuracoesUser: ConfiguracoesUser
}

function StatsCards({from, to, configuracoesUser}: Props) {

  const querySaldo = useQuery<GetSaldoResponseType>({ // fazemos uma consulta ao banco de dados, que retornará um objeto com entrada e saida do usuario
    queryKey: ['overview', 'estatisticas', from, to], // usamos essa queryKey para, quando o range de datas for alterado, ou quando criarmos uma nova transacao, ocorra um refetch nessa query
    queryFn: () => 
      fetch(`/api/estatisticas/saldo?from=${DataToUTCDate(from)}&to=${DataToUTCDate(to)}`)  // fazemos uma chamada get a api para pegar o saldo do usuario no range de data
      .then(res => res.json()) 
  });

  const formatter = useMemo(() => {                   // usando o hook useMemo para memorizar o valor do GetFormatterMoeda com o parâmetro da moeda do usuario
    return GetFormatterMoeda(configuracoesUser.moeda) // esse hook é usado para evitar que o GetFormatterMoeda seja chamado toda vez que o componente for renderizado
  }, [configuracoesUser.moeda])                       // a função só vai ser refeita quando a moeda do usuário for alterada

  const entrada = querySaldo.data?.entrada || 0;      // pegamos o valor de entrada e saida do saldo do usuario, ou 0 caso não exista
  const saida = querySaldo.data?.saida || 0;    
  
  const saldo = entrada - saida;

  return (
    <div className="container relative flex w-full flex-wrap gap-2 md:flex-nowrap mx-auto">
      <SkeletonWrapper isLoading={querySaldo.isFetching}>
        <StatCard formatter={formatter} value={entrada} title={"Entradas"} icon={
        <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-700 bg-emerald-400 opacity-70" />
        } />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={querySaldo.isFetching}>
        <StatCard formatter={formatter} value={saida} title={"Saídas"} icon={
        <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-rose-700 bg-rose-400 opacity-70" />
        } />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={querySaldo.isFetching}>
        <StatCard formatter={formatter} value={saldo} title={"Saldo"} icon={
        <EqualIcon className="h-12 w-12 items-center rounded-lg p-2 text-amber-700 bg-amber-400 opacity-70" />
        } />
      </SkeletonWrapper>
    </div>
  )
}

export default StatsCards

function StatCard ({formatter, value, title, icon}: {
  formatter: Intl.NumberFormat,
  icon: ReactNode,
  title: string,
  value: number,
}) {

  const formatFn = useCallback((value: number) => {
      return formatter.format(value);
  }, [formatter])
  

  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4 mx-auto">
      {icon}
      <div className="flex flex-col items-center gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp preserveValue redraw={false} end={value} decimals={2} formattingFn={formatFn} className="text-2xl"/>
      </div>
    </Card>
  )

}