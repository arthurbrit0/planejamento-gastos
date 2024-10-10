"use server";

import { UpdateMoedaUsuarioSchema } from "@/schema/configuracoesUser";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function UpdateMoedaUsuario(moeda: string) { // função para atualizar a moeda do usuário na página de config
    const parsedBody = UpdateMoedaUsuarioSchema.safeParse({moeda}); // validando a moeda que o usuário escolheu com o schema de validação que criamos usando Zod
    if (!parsedBody.success) { // se não conseguirmos passar a moeda que o usuario escolheu pro corpo da requisição, lançamos um erro
        throw parsedBody.error;
    }

    const user = await currentUser(); // se conseguirmos dar parse na moeda para o corpo da requisicao, verificamos se o usuario está autenticado
    if(!user) {
        redirect("/login"); // se ele não estiver autenticado, redirecionamos para a página de login
    }

    const configuracoesUser = await prisma.configuracoesUser.update({ // aqui, atualizamos as configuracoes do usuario para a moeda que ele escolheu
        where: {
            userId: user.id // selecionaremos o usuario que está autenticado e acharemos as configuracoes atuais dele a partir do id
        },
        data: { // atualizaremos o campo data, mais especificamente o campo moeda para a moeda que foi enviada no corpo da requisição
            moeda: parsedBody.data.moeda
        }
    });

    return configuracoesUser; // retornamos as configurações já atualizadas com a moeda que o usuário escolheu
}
