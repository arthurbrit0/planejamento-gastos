import { Moedas } from "./moedas";

export function DataToUTCDate(data: Date) {
    return new Date(                        // função que retorna uma nova data em formato utc
        Date.UTC(
            data.getUTCFullYear(),          // passamos a data da transação e temos como retorno uma nova data em formato UTC,
            data.getUTCMonth(),             // com os valores de tempo todos em formato UTC
            data.getUTCDate(),
            data.getUTCHours(),
            data.getUTCMinutes(),
            data.getUTCSeconds(),
            data.getUTCMilliseconds(),
        )
    );
}

export function GetFormatterMoeda(moeda: string) {
    const locale = Moedas.find(m => m.value === moeda)?.locale  // pegando o locale do tipo de moeda passado

    return new Intl.NumberFormat(locale, {                      // formatando o valor da moeda para ser exibido nos cards de estatísticas de acordo com o locale da moeda
        style: 'currency',
        currency: moeda,
    });
}