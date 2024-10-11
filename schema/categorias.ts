import { z } from "zod";

export const CriarCategoriaSchema = z.object({
    nome: z.string(), // o nome da categoria é uma string
    tipo: z.enum(["entrada", "saida"]), // o tipo da categoria é entrada ou saida
    icone: z.string().max(20),
});

export type CriarCategoriaSchemaTipo = z.infer<typeof CriarCategoriaSchema> // exportamos, alem do schema, o tipo do schema, que é inferido pelo zod. esse tipo terá os tipos dos campos