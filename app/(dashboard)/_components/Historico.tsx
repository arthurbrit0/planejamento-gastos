"use client";

import { ConfiguracoesUser } from '@prisma/client';
import React, { useCallback, useMemo, useState } from 'react'
import { Periodo, Calendario } from '@/lib/tipos';
import { GetFormatterMoeda } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HistoricoPeriodoSelector from './HistoricoPeriodoSelector';
import { useQuery } from '@tanstack/react-query';
import { GetHistoricoDadosResponseType } from '@/app/api/historico-data/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import CountUp from 'react-countup';
import { 
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { cn } from '@/lib/utils';

function Historico({configuracoesUser}: {configuracoesUser: ConfiguracoesUser}) { // componente de histórico que sera exibido na pagina de dashboard

    const [calendario, setCalendario] = useState<Calendario>("mes")               // criamos um estado para o calendario, que será inicializado com "mes"
    const [periodo, setPeriodo] = useState<Periodo>({                             // criamos um estado para o periodo, que será inicializado com o mês e ano atual
        mes: new Date().getMonth(),
        ano: new Date().getFullYear()
    })

    const formatter = useMemo(() => {                                             // usando o hook useMemo para memorizar o valor do GetFormatterMoeda com o parâmetro da moeda do usuario
        return GetFormatterMoeda(configuracoesUser.moeda)                         // essa função formatará o valor da moeda do usuário, para ser exibido nos cards de estatísticas
    }, [configuracoesUser.moeda]);

    const historicoDadosQuery = useQuery<GetHistoricoDadosResponseType>({         // usando o hook useQuery para buscar os dados do histórico
        queryKey: ['overview', 'historico', calendario, periodo],                 // passamos a chave da query, que é um array com o tipo da query, o calendario e o periodo
        queryFn: async () => {
            const res = await fetch(`/api/historico-data?calendario=${calendario}&mes=${periodo.mes}&ano=${periodo.ano}`);  // a query fara uma chamada a api passsando os parametros de query
            if (!res.ok) {                                                                                                  // calendario, mes e ano do periodo passado. inicialmente, esse período tem o mes e o ano atuais
                throw new Error('Erro ao buscar dados');
            }
            return res.json();                                                    // retornamos os dados da resposta, com o historico do periodo passado, sendo essa resposta um array de objetos com saida e entrada
        }                                                                         // de cada dia do mes ou de cada mes do ano, dependendo do calendario passado
    })

    const dadosDisponiveis = historicoDadosQuery.data && historicoDadosQuery.data.length > 0;                

  return (
    <div className="container">
      <h2 className="mt-12 text-3xl font-bold">Histórico</h2>
      <Card className="mt-12 text-3xl font-bold">
        <CardHeader className="gap-2">
            <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
                {/* O componente HistoricoPeriodoSelector mostrará um seletor de periodos, além de um seletor de tipo de calendario */}
                <HistoricoPeriodoSelector periodo={periodo} setPeriodo={setPeriodo} calendario={calendario} setCalendario={setCalendario}/>	
                <div className="flex h-10 gap-2">
                    <Badge variant={"outline"} className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4 rounded-full bg-emerald-500">
                        </div>
                        Entrada
                    </Badge>
                    <Badge variant={"outline"} className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4 rounded-full bg-rose-500">
                        </div>
                        Saída
                    </Badge>
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <SkeletonWrapper isLoading={historicoDadosQuery.isFetching}>
                {
                    dadosDisponiveis && 
                    <ResponsiveContainer width={"100%"} height={300}>
                        <BarChart height={300} data={historicoDadosQuery.data} barCategoryGap={5}>
                            <defs>
                                <linearGradient id="entradaBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={"0"} stopColor="#10b981" stopOpacity={"1"} />
                                    <stop offset={"1"} stopColor="#10b981" stopOpacity={"0"} />
                                </linearGradient>
                                <linearGradient id="saidaBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={"0"} stopColor="#ef4444" stopOpacity={"1"} />
                                    <stop offset={"1"} stopColor="#ef4444" stopOpacity={"0"} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="5 5" strokeOpacity={"0.2"} vertical={false} />
                            <XAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} padding={{left: 5, right: 5}}
                                dataKey={(dados) => {
                                    const {ano, mes, dia} = dados;
                                    const data = new Date(ano, mes, dia || 1);
                                    if(calendario === "ano") {
                                        return data.toLocaleDateString("default", {
                                            month: "long",
                                        });
                                    }

                                    return data.toLocaleDateString("default", {
                                        day: "2-digit",
                                    })
                                }}
                            />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <Bar dataKey={"entrada"} label="Entrada" fill="url(#entradaBar)" radius={4} className="cursor-pointer" />
                            <Bar dataKey={"saida"} label="Saída" fill="url(#saidaBar)" radius={4} className="cursor-pointer" />

                            <Tooltip cursor={{opacity: 0.1}} content={props => (
                                <CustomTooltip formatter={formatter} {...props} />
                            )}/>

                        </BarChart>
                    </ResponsiveContainer>
                }
                {
                    !dadosDisponiveis && (
                        <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
                            Sem dados para o período selecionado.
                            <p className="text-sm text-muted-foreground">
                                Tente selecionar outro periodo!
                            </p>
                        </Card>
                    )
                }
            </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  )
}

export default Historico

function CustomTooltip({active, payload, formatter}: any) {
    if(!active || !payload || payload.length===0) return null;

    const dados = payload[0].payload;
    const {entrada, saida, ano, mes, dia} = dados;

    return (
        <div className="min-w-[300px] rounded border bg-background p-4">
            <TooltipRow formatter={formatter} label="Saida" value={saida} bgColor="bg-red-500" textColor="text-red-500" />
            <TooltipRow formatter={formatter} label="Entrada" value={entrada} bgColor="bg-emerald-500" textColor="text-emerald-500" />
            <TooltipRow formatter={formatter} label="Saldo" value={entrada-saida} bgColor="bg-gray-100" textColor="text-foreground" />
        </div>
    )
}

function TooltipRow({formatter, label, value, bgColor, textColor}: {
    label: string,
    textColor: string,
    bgColor: string,
    value: number,
    formatter: Intl.NumberFormat,
}) {

    const formattingFn = useCallback((value: number)=>{
        return formatter.format(value)
    }, [formatter])

    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "h-4 w-4 rounded-full", bgColor
            )}/>
            <div className="flex w-full justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className={cn(
                    "text-sm font-bold", textColor
                )}>
                    <CountUp 
                        duration={0.5} 
                        preserveValue 
                        end={value} 
                        decimals={0} 
                        formattingFn={formattingFn} 
                        className="text-sm"
                    /> 
                </div>
            </div>
        </div>
    )
}
