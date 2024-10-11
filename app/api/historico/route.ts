import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {           // rota da api com método get para pegar os periodos de um usuario
    const user = await currentUser();                   // verificamos se o usuario está autenticado

    if(!user) {
        redirect('/login');                             // se não estiver, redirecionamos para a página de login
    }

    const periodos = await getPeriodos(user.id);              // pegamos os periodos do usuario, passando o id do usuario para a funcao getPeriodos, definida abaixo
    return Response.json(periodos);                     // retornamos os periodos do usuario
}

export type GetPeriodosResponseType = Awaited<ReturnType<typeof getPeriodos>>  // exportamos o tipo de retorno da função getPeriodos

async function getPeriodos(userId: string) {            // função que pega os periodos de um usuario
    const resultado = await prisma.historicoMes.findMany({  // pegamos os historicos de mes do usuario
        where: {
            userId,       
        },
        select: {
            ano: true,                                  // selecionamos o ano
        },
        distinct: ['ano'],                              // pegamos os anos distintos
        orderBy: [                                      // ordenamos os resultados por ano em ordem crescente
            {
                ano: "asc",                             // a função getPeriodos retorna um array de objetos, com chave ano e o valor do ano
            },
        ],
    });

    const anos = resultado.map((r) => r.ano);           // mapeamos os resultados para pegar apenas os anos
    if(anos.length === 0) {
        return [new Date().getFullYear()];              // se não houver resultados, retornamos o ano atual
    }

    return anos;                                        // retornamos os anos encontrados, em formato de array

}