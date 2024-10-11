import { z } from "zod";

export const CriarTransacaoSchema = z.object({
    valor: z.coerce.number().positive().multipleOf(0.01), // validamos os dados de uma transacao com o zod. nessa linha, o valor precisa ser um numero positivo e multiplo de 0.01, para representar os centavos
    descricao: z.string().optional(), // a descrição é uma string e é opcional, então não é obrigatória	
    data: z.coerce.date(), // a data usa o coerce para parsear forçadamente o valor para uma formatação de data
    categoria: z.string(), // a categoria é uma string
    tipo: z.union([
        z.literal("entrada"), // o tipo pode ser entrada ou saida
        z.literal("saida")
    ])
});

export type CriarTransacaoSchemaTipo = z.infer<typeof CriarTransacaoSchema> // exportamos, alem do schema, o tipo do schema, que é inferido pelo zod. esse tipo terá os tipos dos campos