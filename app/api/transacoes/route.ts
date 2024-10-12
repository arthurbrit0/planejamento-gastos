import { GetFormatterMoeda } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { get } from "http";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const user = await currentUser();
  
    if(!user) {
        redirect('/login');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    
    const queryParams = OverviewQuerySchema.safeParse({
        from,
        to,
    });

    if(!queryParams.success) {
        return Response.json("Erro ao buscar transações", {status: 400});
    }

    const transacoes = await getTransacoes(user.id, queryParams.data.from, queryParams.data.to);

    return Response.json(transacoes)
}

export type GetTransacoesResponseType = Awaited<ReturnType<typeof getTransacoes>>

async function getTransacoes(userId: string, from: Date, to: Date) {
    const configuracoesUser = await prisma.configuracoesUser.findUnique({
        where: {
            userId,
        }
    })

    if(!configuracoesUser) {
        throw new Error("Configurações do usuário não foram encontradas!")
    }

    const formatter = GetFormatterMoeda(configuracoesUser.moeda);

    const transacoes = await prisma.transacao.findMany({
        where: {
            userId,
            data: {
                gte: from,
                lte: to,
            }
        },
        orderBy: {
            data: "desc",
        }
    });

    return transacoes.map((transacao) => ({
        ...transacao,
        valorFormatado: formatter.format(transacao.valor),
    }))
}