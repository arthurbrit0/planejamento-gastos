"use client";

import { ConfiguracoesUser } from '@prisma/client';
import React, { useMemo, useState } from 'react'
import { Periodo, Calendario } from '@/lib/tipos';
import { GetFormatterMoeda } from '@/lib/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HistoricoPeriodoSelector from './HistoricoPeriodoSelector';

function Historico({configuracoesUser}: {configuracoesUser: ConfiguracoesUser}) { // componente de histórico que sera exibido na pagina de dashboard

    const [calendario, setCalendario] = useState<Calendario>("mes")               // criamos um estado para o calendario, que será inicializado com "mes"
    const [periodo, setPeriodo] = useState<Periodo>({                             // criamos um estado para o periodo, que será inicializado com o mês e ano atual
        mes: new Date().getMonth(),
        ano: new Date().getFullYear()
    })

    const formatter = useMemo(() => {                                             // usando o hook useMemo para memorizar o valor do GetFormatterMoeda com o parâmetro da moeda do usuario
        return GetFormatterMoeda(configuracoesUser.moeda)                         // essa função formatará o valor da moeda do usuário, para ser exibido nos cards de estatísticas
    }, [configuracoesUser.moeda]);

  return (
    <div className="container">
      <h2 className="mt-12 text-3xl font-bold">Histórico</h2>
      <Card className="mt-12 text-3xl font-bold">
        <CardHeader className="gap-2">
            <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
                {/* O componente HistoricoPeriodoSelector mostrará os gráficos de cada mês do período escolhido */}
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
      </Card>
    </div>
  )
}

export default Historico
