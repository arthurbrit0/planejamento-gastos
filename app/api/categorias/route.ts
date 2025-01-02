import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {   // fazendo uma rota GET para pegar as categorias do usuario logado
    const user = await currentUser();           // pegamos o usuario logado
    if (!user) {
        redirect('/login');                     // se ele não estiver logados, o redirecionamos para a página de login
    }

    const {searchParams} = new URL(request.url) // pegamos os parametros da url
    const paramType = searchParams.get("tipo")  // pegamos o parametro tipo da url
    const validator = z.enum(["entrada", "saida"]).nullable(); // validamos o parametro tipo

    const queryParams = validator.safeParse(paramType) // validando o tipo
    if (!queryParams.success) {
        return Response.json(queryParams.error, {status: 400}); // se não for válida, retornamos um json com o erro e o status 400
    }

    const tipo = queryParams.data;                              // se o tipo for válido, pegamos o tipo, acessando o campo data da resposta da validacao
    const categorias = await prisma.categoria.findMany({        // achamos as categorias do usuario logado
        where: {
            userId: user.id,
            ...(tipo && {tipo})                                 // onde o tipo for igual ao tipo passado na url
        },
        orderBy: {
            nome: "asc"                                         // ordenamos os resultados por nome em ordem crescente
        }
    });

    return Response.json(categorias);                           // retornamos as categorias do usuario logado
}
