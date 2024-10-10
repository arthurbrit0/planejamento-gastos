import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) { // função GET para pegar as configurações do usuário
    const user = await currentUser(); // pegando o usuário autenticado
    if(!user) {
        redirect("/login"); // se ele não estiver autenticado, será redirecionado para a página de login
    }

    let configuracoesUser = await prisma.configuracoesUser.findUnique({ // acharemos um único usuario com configurações, onde o id desse usuário é igual ao id do usuário autenticado
        where: {
            userId: user.id
        }
    });

    if (!configuracoesUser) { // se não acharmos configurações para esse usuário logado, criaremos uma nova
        configuracoesUser = await prisma.configuracoesUser.create({
            data: {
                moeda: "BRL", // definiremos a moeda brasileira como default desse usuario
                userId: user.id
            }
        });
    }

    // revalidando a pagina home que usa a configuração do usuário, especialmente a moeda
    revalidatePath("/");

    return Response.json(configuracoesUser); // retornaremos ou a nova configuração, caso o usuário ainda não tenha, ou a configuração que ele já tem
}