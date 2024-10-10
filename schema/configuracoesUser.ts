import { Moedas } from "@/lib/moedas";
import {z} from "zod";

export const UpdateMoedaUsuarioSchema = z.object({ // usando zod para validar a moeda do usuario
    moeda: z.custom(value => { // pegaremos o valor da moeda, e verificaremos se ele é igual a algum valor de moeda que temos no array Moedas
        const achados = Moedas.some((c) => c.value === value);
        if (!achados) {
            throw new Error(`Moeda não encontrada:${value}`);
        }

        return value;
    })
})