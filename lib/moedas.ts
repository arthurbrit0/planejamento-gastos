// criando os tipos de moeda. na aplicacao, por enquanto, so terão dolar e real
export const Moedas = [
    {value: "USD" , label: "$ Dólar Americano", locale: "en-US"},
    {value: "BR" , label: "R$ Real", locale: "pt-BR"},
]

export type Moeda = (typeof Moedas)[0]; // exportando o tipo de moeda