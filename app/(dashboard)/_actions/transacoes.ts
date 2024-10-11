"use server";

import { CriarTransacaoSchema, CriarTransacaoSchemaTipo } from "@/schema/transacao";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function CriarTransacao(form: CriarTransacaoSchemaTipo) {      // função que recebe um formulário tipado com os campos do schema CriarTransacaoSchema
    const parsedBody = CriarTransacaoSchema.safeParse(form);                // validamos os dados passados no formulário
    if(!parsedBody.success) {
        throw new Error(parsedBody.error.message)                           // se der algum erro na validação dos dados, retornamos um erro
    }

    const user = await currentUser();                                       // verificamos se o usuario está autenticado
    if(!user) {
        redirect('/login');                                                 // se não estiver, o redirecionamos para a página de login
    }

    const {valor, categoria, data, descricao, tipo} = parsedBody.data;      // após fazer a validação dos dados do formulário, obtemos o valor, a categoria, a data, a descricao e o tipo da transação
    const categoryRow = await prisma.categoria.findFirst({                  // tentamos achar a categoria criada pelo usuario que enviou o formulário
        where: {
            userId: user.id,
            nome: categoria,
        },
    });

    if(!categoryRow) {
        throw new Error("Categoria não encontrada");                         // se o usuário não tiver aquela categoria, retornamos um erro
    }

    await prisma.$transaction([                                              // a operação transaction do prisma serve para tornar a execução das funções atômica
        prisma.transacao.create({                                            // ou seja, ou todas são executadas ou nenhuma delas é caso alguma delas falhe
            data: {                                                          // nesse caso, criamos uma nova transacao com os dados passados no formulário pelo usuário
                valor,
                descricao: descricao || "",
                data,
                tipo,
                categoria: categoryRow.nome,
                userId: user.id,
                iconeCategoria: categoryRow.icone,
            },
        }),
        prisma.historicoMes.upsert({                                         // o upsert cria um registro na tabela historicoMes se ele não existir, e atualiza se ele já existir
            where: {
                dia_mes_ano_userId: {                                        // achamos um registro de transacao do usuario no dia, mes e ano especifico
                    userId: user.id,
                    dia: data.getUTCDate(),
                    mes: data.getUTCMonth(),
                    ano: data.getUTCFullYear(),
                },
            },

            create: {                                                        // se o prisma não encontrar esse registro, ele cria um novo com os dados fornecidos
                userId: user.id,
                dia: data.getUTCDate(),
                mes: data.getUTCMonth(),
                ano: data.getUTCFullYear(),
                saida: tipo === "saida" ? valor : 0,
                entrada: tipo === "entrada" ? valor : 0,
            },

            update: {                                                        // se o prisma encontrar esse registro, ele atualiza o valor da transacao, somando
                saida: {                                                     // o valor da saida ou da entrada já existente no registro com outra saida ou entrada, usando o increment
                    increment: tipo === "saida" ? valor : 0,
                },
                entrada: {
                    increment: tipo === "entrada" ? valor : 0,
                },
            }
        }),
        prisma.historicoAno.upsert({                                         // o mesmo se aplica ao upsert na tabela historicoAno
            where: {
                mes_ano_userId: {
                    userId: user.id,
                    mes: data.getUTCMonth(),
                    ano: data.getUTCFullYear(),
                },
            },

            create: {
                userId: user.id,
                mes: data.getUTCMonth(),
                ano: data.getUTCFullYear(),
                saida: tipo === "saida" ? valor : 0,
                entrada: tipo === "entrada" ? valor : 0,
            },

            update: {
                saida: {
                    increment: tipo === "saida" ? valor : 0,
                },
                entrada: {
                    increment: tipo === "entrada" ? valor : 0,
                },
            }
        })
    ])                                                                          // ou seja, nós criamos uma nova transação e atualizamos as tabelas de historicoMes e historicoAno para o dia/mes especifico
}                                                                               // as operações só serão realmente feitas se todas derem certo. caso alguma falhe, tudo é revertido