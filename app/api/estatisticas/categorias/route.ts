import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {                                                       // roda da aplicação com método get para pegar as estatisticas de categorias de um usuario
    const user = await currentUser();                                                               // verificamos se o usuario está autenticado

    if(!user) {
        redirect('/login');                                                                         // se não estiver, redirecionamos para a página de login
    }

    const { searchParams } = new URL(request.url);                                                  // pegamos os parametros de busca da url
    const from = searchParams.get('from');                                                          // pegamos o from e o to dos parâmetros da url
    const to = searchParams.get('to'); 

    const queryParams = OverviewQuerySchema.safeParse({from, to});                                  // validamos os parâmetros da url usando o esquema de validação do zod
    if(!queryParams.success) {
        throw new Error(queryParams.error.message)
    }

    const estatisticas = await getCategorias(user.id, queryParams.data.from, queryParams.data.to);  // usamos a função getCategorias, passando o id do usuario, o from e o to

    return Response.json(estatisticas);                                                             // retornamos as estatísticas de categorias do usuario encontrado
}

export type GetCategoriasResponseType = Awaited<ReturnType<typeof getCategorias>>                   // exportamos o tipo de retorno da função getCategorias

function getCategorias(userId: string, from: Date, to: Date) {                                      // função que pega as estatísticas das categorias de um usuario
    return prisma.transacao.groupBy({
        by: ['tipo','categoria', 'iconeCategoria'],                                                 // agrupamos as transações pelo tipo (entrada ou saida), categoria e iconeCategoria
        where: {                                                                                    // de um usuario especifico em um range de data
            userId,
            data: {
                gte: from,
                lte: to,
            }
        },
        _sum: {                                                                                     // somamos os valores das transações de cada categoria na data especifica
            valor: true,
        },
        orderBy: {                                                                                  // ordenamos as categorias pelo valor total de transações           
            _sum: { 
                valor: 'desc',
            }
        }
    });
}