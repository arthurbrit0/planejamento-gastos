import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Calendario, Periodo } from "@/lib/tipos";
import { getDaysInMonth } from "date-fns";

const getHistoricoDadosSchema = z.object({                 // definimos um schema para validar os parametros de query
    calendario: z.enum(["mes", "ano"]),                    // o calendário só podera ser de dois tipos: mes ou ano
    ano: z.coerce.number().min(1000).max(3000),            // o ano precisará estar entre 1000 e 3000
    mes: z.coerce.number().min(0).max(11),                 // o mês precisará estar entre 0 e 11, com 11 representando dezembro
});

export async function GET(request: Request) {              // a função GET irá buscar os dados do histórico do usuário
    const user = await currentUser();                      // verificamos se o usuario está autenticado

    if(!user) {
        redirect('/login');                                // se o usuário não estiver autenticado, redirecionamos para a página de login    
    }

    const { searchParams } = new URL(request.url);         // pegamos os parametros de query da url da requisicao
    const calendario = searchParams.get("calendario");     // pegamos o calendario, ano e mes da query
    const ano = searchParams.get("ano");                   
    const mes = searchParams.get("mes");

    const queryParams = getHistoricoDadosSchema.safeParse({calendario, ano, mes}); // fazemos a validacao dos dados com o esquema que criamos acima

    if(!queryParams.success) {
        return Response.json(queryParams.error.message, {status: 400,});           // se não der para validar, retornamos uma mensagem de erro
    }

    const dados = await getHistoricoDados(user.id, queryParams.data.calendario, {  // usamos a função getHistoricoDados, passando o userId, o calendario e o periodo
        ano: queryParams.data.ano,                                                 // que é um objeto com o ano e o mes
        mes: queryParams.data.mes,                                                 
    });

    return Response.json(dados);
}

export type GetHistoricoDadosResponseType = Awaited<ReturnType<typeof getHistoricoDados>>; // retornando o tipo da resposta da função getHistoricoDados

async function getHistoricoDados(userId: string, calendario: Calendario, periodo: Periodo) {  // a função getHistoricoDados recebera o id do usuario, um calendario e um periodo
    switch (calendario) {                                                                     // o calendario so pode ser mes ou ano. 
        case "mes":                                                                           // caso o calendario seja mes, chamaremos a funcao getHistoricoDadosMes, onde agruparemos os dados por ano/mes para cada um dos dias do mes
            return await getHistoricoDadosMes(userId, periodo.ano, periodo.mes);
        case "ano":                                                                           // caso o calendario seja ano, chamaremos a funcao getHistoricoDadosAno, onde agruparemos os dados por mes de cada ano
            return await getHistoricoDadosAno(userId, periodo.ano);
    }
}

type HistoricoDados = {     // criando um tipo que sera usado no array historico, que tera os dados de entrada e saida de um periodo
    saida: number,
    entrada: number,
    ano: number,
    mes: number,
    dia?: number,
}

async function getHistoricoDadosAno(userId: string, ano: number) { // a função getHistoricoDadosAno irá agrupar os dados de entrada e saida por mes de um ano
    const resultado = await prisma.historicoAno.groupBy({          // usamos a função groupBy do prisma para agrupar os dados por mes
       by: ["mes"],
       where: {
          userId,                                                  // agruparemos os dados de entrada e saida por mes de cada ano, pertencente ao usuario do id passado e no ano passado
          ano,
       },
       _sum: {                                                     // somaremos os valores de saida e entrada de cada mes
            saida: true,
            entrada: true,
       },
       orderBy: [                                                  // ordenamos os resultados em ordem crescente de mes (0 - 11)
        {
            mes: 'asc',
        },
       ],
    });

    if(!resultado || resultado.length===0) return [];              // se não houver resultados, retornamos um array vazio

    const historico: HistoricoDados[] = [];                        // se houver resultados, criaremos um array historico que contem objetos de tipo HistoricoDados

    for (let i = 0; i < 12; i++) {                                 // para cada um dos meses do ano, definiremos os valores de entrada e de saida como 0, sendo default
        let saida = 0;
        let entrada = 0;

        const mes = resultado.find((linha) => linha.mes === i);    // para cada mes, verificamos se há um resultado no array resultado para aquele mes especifico
        if(mes) {                                                  // se já existir valores de entrada e saida para um mes especifico, armazenamos os valores de entrada e saida desse mes
            saida = mes._sum.saida || 0;
            entrada = mes._sum.entrada || 0;
        }

        historico.push({                                           // adicionamos um objeto ao array historico com os valores de entrada e saida para o mes especifico
            saida,                                                 // se o mes não tiver valores de entrada e saida, os valores default serão 0
            entrada,                                               // isso torna mais fácil de tratar os valores no frontend, pois os valores já serão setados como 0 para todo mes que não tem registros
            ano,
            mes: i,
        })
    }

    return historico;                                              // retornaremos esse array de objetos já preenchidos com os valores de entrada e saida para cada mes do ano
}

async function getHistoricoDadosMes(userId: string, ano: number, mes: number) { // já na funcao getHistoricoDadosMes, passaremos o id do usuario, o ano e o mes selecionados no frontend
    const resultado = await prisma.historicoMes.groupBy({                       // pegamos os dados de entrada e saida agrupados por dia de um mes especifico
        by: ["dia"],                                                            // cada um dos dias do mes especifico tera dados de entrada e saida
        where: {
            userId,                                                             // agruparemos esses dados por dia para o mes e ano especificados, pertencente ao usuario do id passado
            ano,
            mes,
        },
        _sum: {                                                                 // somaremos os valores de entradas e saidas para cada dia do mes especificado do ano especificado
            saida: true,
            entrada: true,
        },
        orderBy: [
            {
                dia: 'asc',                                                     // retornaremos essa resposta com os dias em ordem crescente (1-30 ou 31)
            }
        ]
    })

    if(!resultado || resultado.length===0) return [];                           // se não houver resultados, retornamos um array vazio  

    const historico: HistoricoDados[] = [];                                     // se houver resultados, criaremos um array historico que contem objetos de tipo HistoricoDados

    const diasNoMes = getDaysInMonth(new Date(ano, mes));                       // pegamos o numero de dias no mes passado como parametro da funcao
    for (let i = 1; i <= diasNoMes; i++) {                                      // para cada um dos dias do mes, definiremos os valores de entrada e de saida como 0, sendo default
        let saida = 0;
        let entrada = 0;

        const dia = resultado.find((linha) => linha.dia === i);                 // para cada dia, verificamos se há um resultado no array resultado para aquele dia especifico
        if(dia) {                                                               // se já existir valores de entrada e saida para um dia especifico, armazenamos os valores de entrada e saida desse dia
            saida = dia._sum.saida || 0;                                        // pegando os valores de saida desse dia que foi achado no banco
            entrada = dia._sum.entrada || 0;                                    // pegando os valores de entrada desse dia que foi achado no banco
        }

        historico.push({                                                        // para cada um dos dias, adicionaremos os seus valores de entrada, saida, ano do dia e mes do dia ao array historico             
            saida,                                                              // assim, todos os dias terão valores, mesmo que sejam 0 para entrada e saida (default)
            entrada,
            ano,
            mes,
            dia: i,
        });
    }

    return historico;                                                           // retornaremos esse array de objetos já preenchidos com os valores de entrada e saida para cada dia do mes
}