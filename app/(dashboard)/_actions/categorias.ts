"use server";

import { CriarCategoriaSchema, CriarCategoriaSchemaTipo } from "@/schema/categorias";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function CriarCategoria(form: CriarCategoriaSchemaTipo) {
    const parsedBody = CriarCategoriaSchema.safeParse(form); // validando o corpo da requisição com o schema de validação que criamos usando Zod
    if(!parsedBody.success) {
        throw new Error("Erro ao criar categoria");
    }

    const user = await currentUser();
    if(!user) {
        redirect("/login");
    }

    const {nome, icone, tipo} = parsedBody.data;  
    return await prisma.categoria.create({
        data: {
            userId: user.id,
            nome,
            icone,
            tipo,
        }
    });
}