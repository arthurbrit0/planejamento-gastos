import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Calendario, Periodo } from "@/lib/tipos";
import { getDaysInMonth } from "date-fns";

const getHistoricoDadosSchema = z.object({
    calendario: z.enum(["mes", "ano"]),
    ano: z.coerce.number().min(1000).max(3000),
    mes: z.coerce.number().min(0).max(11),
});

export async function GET(request: Request) {
    const user = await currentUser();

    if(!user) {
        redirect('/login');
    }

    const { searchParams } = new URL(request.url);
    const calendario = searchParams.get("calendario");
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");

    const queryParams = getHistoricoDadosSchema.safeParse({calendario, ano, mes});

    if(!queryParams.success) {
        return Response.json(queryParams.error.message, {status: 400,});
    }

    const dados = await getHistoricoDados(user.id, queryParams.data.calendario, {
        ano: queryParams.data.ano, 
        mes: queryParams.data.mes,
    });

    return Response.json(dados);
}

export type GetHistoricoDadosResponseType = Awaited<ReturnType<typeof getHistoricoDados>>;

async function getHistoricoDados(userId: string, calendario: Calendario, periodo: Periodo) {
    switch (calendario) {
        case "mes":
            return await getHistoricoDadosMes(userId, periodo.ano, periodo.mes);
        case "ano":
            return await getHistoricoDadosAno(userId, periodo.ano);
    }
}

type HistoricoDados = {
    saida: number,
    entrada: number,
    ano: number,
    mes: number,
    dia?: number,
}

async function getHistoricoDadosAno(userId: string, ano: number) {
    const resultado = await prisma.historicoAno.groupBy({
       by: ["mes"],
       where: {
          userId,
          ano,
       },
       _sum: {
            saida: true,
            entrada: true,
       },
       orderBy: [
        {
            mes: 'asc',
        },
       ],
    });

    if(!resultado || resultado.length===0) return [];

    const historico: HistoricoDados[] = [];

    for (let i = 0; i < 12; i++) {
        let saida = 0;
        let entrada = 0;

        const mes = resultado.find((linha) => linha.mes === i);
        if(mes) {
            saida = mes._sum.saida || 0;
            entrada = mes._sum.entrada || 0;
        }

        historico.push({
            saida,
            entrada,
            ano,
            mes: i,
        })
    }

    return historico;
}

async function getHistoricoDadosMes(userId: string, ano: number, mes: number) {
    const resultado = await prisma.historicoMes.groupBy({
        by: ["dia"],
        where: {
            userId,
            ano,
            mes,
        },
        _sum: {
            saida: true,
            entrada: true,
        },
        orderBy: [
            {
                dia: 'asc',
            }
        ]
    })

    if(!resultado || resultado.length===0) return [];

    const historico: HistoricoDados[] = [];

    const diasNoMes = getDaysInMonth(new Date(ano, mes));
    for (let i = 1; i <= diasNoMes; i++) {
        let saida = 0;
        let entrada = 0;

        const dia = resultado.find((linha) => linha.dia === i);
        if(dia) {
            saida = dia._sum.saida || 0;
            entrada = dia._sum.entrada || 0;
        }

        historico.push({
            saida,
            entrada,
            ano,
            mes,
            dia: i,
        });
    }

    return historico;
}