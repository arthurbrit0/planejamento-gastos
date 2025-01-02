"use client";

import { ReactNode, useState } from "react";
import { TipoTransacao } from "@/lib/tipos";
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage} from "@/components/ui/form";
import { CriarTransacaoSchema, CriarTransacaoSchemaTipo } from "@/schema/transacao";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import EscolherCategoria from "./EscolherCategoria";
import { useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CriarTransacao } from "../_actions/transacoes";
import { toast } from "sonner";
import { DataToUTCDate } from "@/lib/helpers";

/*

Esse componente servirá como um wrapper para criar um dialogo de transacao. Passaremos props para esse componente, que serão trigger e tipo.
O trigger será o ReactNode (componente) que ativará esse dialogo. Já o tipo será o tipo de dialogo que será mostrado (saida ou entrada).
Esse componente servirá como wrapper na página de dashboard, ou seja, envolveremos os botões de entrada e saída com esse wrapper para que, quando
clicarmos neles, os dialogos dos respectivos tipos de botões sejam exibidos na tela.

*/ 

interface Props {
    trigger: ReactNode;                                         // aqui, o trigger será um nó do react (um componente) que ativará o dialogo
    tipo: TipoTransacao;                                        // recebemos também o tipo da transacao. o tipo TipoTransacao foi definido no arquivo lib/tipos, e aceita "entrada" ou "saida"
}

function DialogoCriarTransacao({trigger, tipo}: Props) {
    
    const [open, setOpen] = useState(false);                    // definindo o estado do dialogo como fechado inicialmente

    const form = useForm<CriarTransacaoSchemaTipo>({            // usamos o hook useForm para criar um formulário com o schema de validação CriarTransacaoSchemaTipo
        resolver: zodResolver(CriarTransacaoSchema),            // o generic <CriarTransacaoSchemaTipo> serve para tipar o formulário com o schema criado
        defaultValues: {                                        // o zodResolver usa o schema CriarTransacaoSchema para validar os dados do formulario de acordo com o schema CriarTransacaoSchema
            tipo,                                               // definindo valores default para o formulario
            data: new Date(),
        }
    })

    const handleCategoria = useCallback((categoria: string) => {
        form.setValue("categoria", categoria)                   // função que recebe uma categoria e setea o valor do campo categoria do formulario com essa categoria passada    
    }, [form]);                                                 // usando o useCallback, evitamos que a função seja recriada a cada renderização do componente, só sendo recriada quando o form for atualizado
    
    const queryClient = useQueryClient();                       // usando o useQueryClient para ter acesso ao cache

    const {mutate, isPending} = useMutation({                   // usando o useMutation para criar a transacao no banco de dados
        mutationFn: CriarTransacao,                             // usando a função CriarTransacao, criada no diretiorio lib, 
        onSuccess: () => {                                      // se conseguirmos criar a transacao, lancamos um toast de sucesso
            toast.success("Transação criada com sucesso!", {
                id: "criar-transacao",
            });

            form.reset({                                        // resetamos o form criado com o useForm, deixando valores vazios/default
                tipo,
                descricao: "",
                valor: 0,
                data: new Date(),
                categoria: undefined,
            });

            queryClient.invalidateQueries({                     // após criar a transação, invalidamos a query transacoes, para que seja feito um refetch dos dados e a pagina seja atualizada
                queryKey: ["overview"],                         // esse refetch sera feito na pagina principal de overview dos dados
            });

            setOpen((prev) => !prev);                           // setamos o estado do dialogo como o fechado 
        }
    });

    const onSubmit = useCallback((values: CriarTransacaoSchemaTipo) => {          // função que será chamada quando o formulário de criação de transação for submitado
        toast.loading("Criando transação...", {                                   // mostramos um toast de carregamento para o usuário
            id: "criar-transacao",
        });

        mutate({                                                                  // chamamos a função mutate, criada com o hook useMutation, que recebe os valores passados
            ...values,                                                            // como parâmetro na função, no caso os valores dos campos do formulário, e atualizamos a data desses valores
            data: DataToUTCDate(values.data),                                     // com a função DataToUTCDate, feita para retirar a ação dos fusos horários na data
        })                                                                         
        }, [mutate])                                                              // o array de dependências do useCallback tem a função mutate, para que essa função onSubmit só seja refeita quando o mutate mudar


    return ( // o trigger será, no nosso caso, um botão na página de dashboard, que, quando clicado, servirá como trigger para abrir o diálogo
        <Dialog open={open} onOpenChange={setOpen}> 
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
                    <form className="px-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                        
                        <div className="flex items-center justify-between gap-2 mt-4">
                            <FormField 
                                control={form.control}
                                name="categoria"
                                render={({ }) => 
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mr-2">
                                            Categoria
                                        </FormLabel>
                                        <FormControl>
                                            <EscolherCategoria tipo={tipo} onChange={handleCategoria} />
                                        </FormControl>
                                    </FormItem>
                                }
                            />
                            <FormField 
                                control={form.control}
                                name="data"
                                render={({ field }) => 
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mr-2">
                                            Data da transação
                                        </FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className="w-[200px] pl-3 text-left font-normal">
                                                            {field.value ? format(field.value, "PPP", {locale: ptBR}) : <span>Selecione uma data</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={field.value} onSelect={value => {
                                                        if (!value) return;
                                                        console.log("@@CALENDAR", value);
                                                        field.onChange(value);
                                                    }} initialFocus />
                                                </PopoverContent>
                                            </Popover>

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                }
                            />
                        </div>
                    </form>
                </Form>
                <div className="mt-3">
                    <DialogFooter>
                        <DialogClose asChild>
                                <Button type="button" variant={"secondary"} onClick={()=> {
                                    form.reset();
                                }}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                                {!isPending && "Criar"}
                                {isPending && <Loader2 className="animate-spin"/>}
                            </Button>
                    </DialogFooter>
                </div>
            </DialogContent>

        </Dialog>
    );
}

export default DialogoCriarTransacao;
