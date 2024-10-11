"use client";

import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants';
import { ConfiguracoesUser } from '@prisma/client';
import { differenceInDays, startOfMonth } from 'date-fns';
import React, { useState } from 'react'
import { toast } from 'sonner';

function Overview({userSettings}: {userSettings: ConfiguracoesUser}) {

    const [rangeData, setRangeData] = useState<{from: Date, to: Date}>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

  return (
    <>
        <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
            <h2 className="text-3xl font-bold">
                Overview
            </h2>
            <div className="flex items-center gap-3">
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
                }/>
            </div>
        </div>
    </>
  )
}

export default Overview
