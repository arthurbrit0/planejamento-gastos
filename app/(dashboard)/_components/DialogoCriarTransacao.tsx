"use client";

import { ReactNode } from "react";
import { TipoTransacao } from "@/lib/tipos";
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { CriarTransacaoSchema, CriarTransacaoSchemaTipo } from "@/schema/transacao";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import EscolherCategoria from "./EscolherCategoria";
import { useCallback } from "react";

/*

Esse componente servirá como um wrapper para criar um dialogo de transacao. Passaremos props para esse componente, que serão trigger e tipo.
O trigger será o ReactNode (componente) que ativará esse dialogo. Já o tipo será o tipo de dialogo que será mostrado (saida ou entrada).
Esse componente servirá como wrapper na página de dashboard, ou seja, envolveremos os botões de entrada e saída com esse wrapper para que, quando
clicarmos neles, os dialogos dos respectivos tipos de botões sejam exibidos na tela.

*/ 

interface Props {
    trigger: ReactNode; // aqui, o trigger será um nó do react (um componente) que ativará o dialogo
    tipo: TipoTransacao; // recebemos também o tipo da transacao. o tipo TipoTransacao foi definido no arquivo lib/tipos, e aceita "entrada" ou "saida"
}

function DialogoCriarTransacao({trigger, tipo}: Props) {
    console.dir(trigger) // receberemos, nesse wrapper, o trigger e o tipo do dialogo
    const form = useForm<CriarTransacaoSchemaTipo>({ // usamos o hook useForm para criar um formulário com o schema de validação CriarTransacaoSchemaTipo
        resolver: zodResolver(CriarTransacaoSchema), // o generic <CriarTransacaoSchemaTipo> serve para tipar o formulário com o schema criado
        defaultValues: { // o zodResolver usa o schema CriarTransacaoSchema para validar os dados do formulario de acordo com o schema CriarTransacaoSchema
            tipo, // definindo valores default para o formulario
            data: new Date(),
        }
    })

    const handleCategoria = useCallback((categoria: string) => {
        form.setValue("categoria", categoria) // função que recebe uma categoria e setea o valor do campo categoria do formulario com essa categoria passada    
    }, [form]);  // usando o useCallback, evitamos que a função seja recriada a cada renderização do componente, só sendo recriada quando o form for atualizado
    

    return ( // o trigger será, no nosso caso, um botão na página de dashboard, que, quando clicado, servirá como trigger para abrir o diálogo
        <Dialog> 
            <DialogTrigger asChild>
                {trigger} 
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                    <span>
                        Criar uma operação de{" "} {/* renderizando o título do dialogo, dependendo do tipo de categoria que for passada como prop */}
                        <span className={cn("m-1", tipo === "entrada" ? "text-emerald-500" : "text-rose-500")}>
                        {tipo}
                        </span>
                    </span>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}> {/* Renderizamos um formulario com as propriedades do form que validamos no comeco da funcao */}
                    <form className="px-6">
                        <FormField  // Criamos campos do formulário que recebem um field e renderizam um item do formulário com um label, um input e uma descrição
                            control={form.control}
                            name="descricao"
                            render={({ field }) => 
                                <FormItem>
                                    <FormLabel>
                                        Descrição
                                    </FormLabel>
                                    <FormControl>
                                        <Input defaultValue={""} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Descrição da transação
                                    </FormDescription>
                                </FormItem>
                            }
                        />
                        <FormField 
                            control={form.control}
                            name="valor"
                            render={({ field }) => 
                                <FormItem>
                                    <FormLabel>
                                        Valor
                                    </FormLabel>
                                    <FormControl>
                                        <Input defaultValue={0} type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Valor da transação
                                    </FormDescription>
                                </FormItem>
                            }
                        />
                        
                        <div className="flex items-center justify-between gap-2">
                            <FormField 
                                control={form.control}
                                name="categoria"
                                render={({ field }) => 
                                    <FormItem>
                                        <FormLabel className="mr-2">
                                            Categoria
                                        </FormLabel>
                                        <FormControl>
                                            <EscolherCategoria tipo={tipo} onChange={handleCategoria} />
                                        </FormControl>
                                        <FormDescription>
                                            Selecione uma categoria
                                        </FormDescription>
                                    </FormItem>
                                }
                            />
                        </div>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
    );
}

export default DialogoCriarTransacao;
