"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { ConfiguracoesUser } from '@prisma/client';
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import StatsCards from './StatsCards';

function Overview({configuracoesUser}: {configuracoesUser: ConfiguracoesUser}) {

    const [rangeData, setRangeData] = useState<{from: Date, to: Date}>({ // criando o estado do range de data 
        from: startOfMonth(new Date()),  // o from será inicializado com o começo do range, com o dia 1 do mês atual
        to: new Date(),                  // o to será inicializado com a data atual
    });

  return (
    <>
        <div className="container mx-auto flex flex-wrap justify-between gap-2 py-6">
            <h2 className="text-3xl font-bold">
                Análise Geral
            </h2>
            <div className="flex items-center gap-3">
                {/* usando o componente DateRangePicker para selecionar o range de data */}
                <DateRangePicker initialDateFrom={rangeData.from} initialDateTo={rangeData.to} showCompare={false} onUpdate={
                    (values) => {        // quando dermos update no range de data, pegamos o range que foi selecionado no picker, pegando o from e o to
                        const { from, to } = values.range;
                        if( !from || !to) return;

                        if(differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                            toast.error("A diferença entre as datas não pode ser maior que 90 dias.");
                            return;      // usamos a função differenceInDays para calcular a diferença de dias entre duas datas. se essa dif for maior que 90, retornamos um erro
                        };

                        setRangeData({from, to}) // caso não tenha nenhum erro no range de datas, setamos o novo range como o range escolhido no picker
                    }
                }/>
            </div>
        </div>
        <div className="container flex w-full flex-col gap-2 mx-auto">
            <StatsCards configuracoesUser={configuracoesUser} from={rangeData.from} to={rangeData.to} />
        </div>
    </>
  )
}

export default Overview
