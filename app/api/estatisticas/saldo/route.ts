import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) { // rota da api com método get para pegar o saldo de um usuario
    const user = await currentUser();         // verificamos se o usuario está autenticado
    if (!user) {
        redirect('/login');                   // se não estiver, redirecionamos para a página de login
    }

    const { searchParams } =  new URL(request.url);  // pegamos os parametros de busca da url
    const from = searchParams.get('from');            // pegamos o from e o to dos parâmetros da url
    const to = searchParams.get('to');

    const queryParams = OverviewQuerySchema.safeParse({from, to})    // validamos os parâmetros da url usando o esquema de validação do zod
    if (!queryParams.success) {                                      // caso a validação falhe, retornamos um erro 400 e o erro da validação
        return Response.json(queryParams.error.message, { status: 400 });
    }

    const estatisticas = await getSaldo(user.id, queryParams.data.from, queryParams.data.to);  // usamos a função get saldo, passando o id do usuario, o from e o to
    return Response.json(estatisticas)                                                         // retornamos as estatísticas de saldo do usuario encontrado                       
}

export type GetSaldoResponseType = Awaited<ReturnType<typeof getSaldo>>

async function getSaldo(userId: string, from: Date, to: Date) {
    const totals = await prisma.transacao.groupBy({ // pegamos as transações do usuario, agrupando-as pelo tipo (entrada ou saida)
        by: ['tipo'],
        where: {                                    // filtramos as transacoes pelo id do usuario e pelo range de data
            userId,
            data: {
                gte: from,
                lte: to,
            },
        },
        _sum: {                                     // somamos os valores das transações
            valor: true,
        }
    });                                             // o totals sera um array com dois objetos: tipo entrada e tipo saida, com o valor total de cada tipo

    return {
        saida: totals.find(t => t.tipo === 'saida')?._sum.valor || 0,           // retornamos o valor total de entrada e saida, ou 0 caso não exista
        entrada: totals.find(t => t.tipo === 'entrada')?._sum.valor || 0,
    }
}