"use client";

import { Periodo, Calendario } from '@/lib/tipos';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GetPeriodosResponseType } from '@/app/api/historico/route';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';

interface Props {
    periodo: Periodo;
    setPeriodo: (periodo: Periodo) => void;
    calendario: Calendario;
    setCalendario: (calendario: Calendario) => void;
}

function HistoricoPeriodoSelector({periodo, setPeriodo, calendario, setCalendario}: Props) { // componente do seletor que sera usado no componente de historico

    const periodos = useQuery<GetPeriodosResponseType>({                                     // fazemos uma consulta ao banco de dados, que retornará um array com os anos que o usuario tem transações
        queryKey: ['overview', 'periodos', 'historico'],
        queryFn: () => fetch('/api/historico').then(res => res.json())                       // essa função retorna os anos que o usuario tem transações, para serem usados no seletor de periodo
    })

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={periodos.isFetching} fullWidth={false}>
        <Tabs value={calendario} onValueChange={value => setCalendario(value as Calendario)}> {/* O componente Tabs será usado para mostrar os TabsTrigger para alternar entre os calendários de ano e mês */}
            <TabsList>
                <TabsTrigger value="ano">Ano</TabsTrigger>                                     {/* O componente TabsTrigger será usado para alternar entre os calendários de ano e mês */}
                <TabsTrigger value="mes">Mês</TabsTrigger>
            </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper isLoading={periodos.isFetching} fullWidth={false}>
            {/* O componente seletor ano será o seletor apenas do ano, o mês continuará igual */}
            <SeletorAno periodo={periodo} setPeriodo={setPeriodo} anos={periodos.data || []} />
        </SkeletonWrapper>
        {calendario === "mes" && (
        <SkeletonWrapper isLoading={periodos.isFetching} fullWidth={false}>
            {/* O componente seletor mes será o seletor apenas do mes, o ano continuará igual */}
            <SeletorMes periodo={periodo} setPeriodo={setPeriodo} />
        </SkeletonWrapper>
        )}
      </div>
    </div>
  )
}

export default HistoricoPeriodoSelector

function SeletorAno({periodo, setPeriodo, anos}: { // o seletor do ano tera como props o periodo, setPeriodo e o array de anos que tem transações do usuario
        periodo: Periodo,
        setPeriodo: (periodo: Periodo) => void,
        anos: GetPeriodosResponseType
    }) {
        return (
            <Select value={periodo.ano.toString()} onValueChange={value => setPeriodo({ // o select tera como valor inicial o ano atual do periodo, e quando selecionarmos outra opcao, chamaremos a funcao setPeriodo
                mes: periodo.mes,                                                       // setaremos o periodo como o ano selecionado e o mes atual  
                ano: parseInt(value)})}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {anos.map((ano) => (
                            <SelectItem key={ano} value={ano.toString()}>
                                {ano}
                            </SelectItem>
                        ))}
                    </SelectContent>
            </Select>
        )
}

function SeletorMes({periodo, setPeriodo}: {
    periodo: Periodo,
    setPeriodo: (periodo: Periodo) => void,
}) {
    return (
        <Select value={periodo.mes.toString()} onValueChange={value => setPeriodo({
            ano: periodo.ano,
            mes: parseInt(value)})}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {[0,1,2,3,4,5,6,7,8,9,10,11].map((mes) => {
                        const mesStr = new Date(periodo.ano, mes).toLocaleString('pt-BR', {month: 'long'});
                        return (
                        <SelectItem key={mes} value={mes.toString()}>
                            {mesStr}
                        </SelectItem>
                        );
                     })
                    }
                </SelectContent>
        </Select>
    )
}
