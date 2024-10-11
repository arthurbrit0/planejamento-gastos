import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import { z } from "zod";

// esquema de validação para a overview

export const OverviewQuerySchema = z.object({
    from: z.coerce.date(),  // validamos o from e o to, que são datas
    to: z.coerce.date(),
}).refine((args) => {       // a função refine recebe argumentos, que no caso serão o from e o to, e os valida com a função differenceInDays, para ver se a diferença entre os dois é maior que 90 dias
    const {from, to} = args;
    const dias = differenceInDays(to, from);

    const isRangeValido = dias >= 0 && dias <= MAX_DATE_RANGE_DAYS;
    return isRangeValido;
})