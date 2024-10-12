"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';
import TabelaTransacoes from './_components/TabelaTransacoes';

function TransacoesPage() {

    const [rangeData, setRangeData] = useState<{from: Date, to: Date}>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });          

  return (
    <>
        <div className="border-b bd-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto">
            <div>
                <p className="text-3xl font-bold">
                    Histórico de transações
                </p>
            </div>
                <DateRangePicker initialDateFrom={rangeData.from} initialDateTo={rangeData.to} showCompare={false} onUpdate={
                        (values) => {                                                   
                            const { from, to } = values.range;
                            if( !from || !to) return;

                            if(differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                                toast.error("A diferença entre as datas não pode ser maior que 90 dias.");
                                return;                                                 
                            };

                            setRangeData({from, to})      

                            }
                        }
                    />
        </div>
        </div>
        <div className="container mx-auto">
            <TabelaTransacoes from={rangeData.from} to={rangeData.to}></TabelaTransacoes>
        </div>
    </>
  )
}

export default TransacoesPage
