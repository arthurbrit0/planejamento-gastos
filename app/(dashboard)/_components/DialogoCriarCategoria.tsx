"use client";

import { TipoTransacao } from "@/lib/tipos";
import { CriarCategoriaSchemaTipo, CriarCategoriaSchema } from "@/schema/categorias";
import React, { ReactNode, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CircleOff, Loader2, PlusSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormItem, FormLabel, FormField, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CriarCategoria } from "../_actions/categorias";
import { Categoria } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Props {
    tipo: TipoTransacao,                                // definindo os tipos das props que serão recebidas pelo dialogo de criar categoria 
    onSuccessCallback: (categoria: Categoria) => void; // definimos uma função de sucesso que será chamada quando a categoria for criada. essa função definirá o valor atual da
    trigger?: ReactNode                                // categoria selecionada no popover no state value e fechará o dialogo.
};

function DialogoCriarCategoria({tipo, onSuccessCallback, trigger }: Props) {

    const [open, setOpen] = React.useState(false);    // state para ver se o dialogo esta aberto ou fechado
    const form = useForm<CriarCategoriaSchemaTipo>({ // usamos o hook useForm para criar um formulário tipado com o schema de validação CriarCategoriaSchemaTipo
        resolver: zodResolver(CriarCategoriaSchema), // usamos o zod, passando o schema de validação para validar os dados do formulário
        defaultValues: {
            tipo 
        }                                           // definimos o valor default do campo tipo do formulário como o tipo passado como prop
    });

    const queryClient = useQueryClient();           // hook para acessar o queryClient
    const tema = useTheme();                        // hook para acessar o tema atual do app

    const {mutate, isPending} = useMutation({       // hook do React Query para alterar a categora no banco de dados, retornando a função para alterar e o estado isPending para ver se a mutação está pendente
        mutationFn: CriarCategoria,                 // passamos como função de mutação a função CriarCategoria, que basicamente valida o corpo da requisição e cria a categoria no banco de dados
        onSuccess: async (data: Categoria) => {     // a função onSuccess é chamada quando a mutação é bem sucedida, resetando o formulário e mostrando um toast de sucesso
            form.reset({
                nome: "",
                icone: "",
                tipo
            });

            toast.success(`Categoria ${data.nome} criada com sucesso!`, {
                id: "criar-categoria",              // esse id é usado para identificar o toast e evitar que ele seja duplicado
            });

            onSuccessCallback(data);                // depois que a categoria for criada, chamamos a função de sucesso passada como prop, setando o valor de value como o da categoriar criada e fechando o popover

            await queryClient.invalidateQueries({   // depois que fizermos a mutação, iremos invalidar a query de categorias, para que ela seja refeita e a categoria criada seja mostrada de forma atualizada
                queryKey: ["categorias"],           // ou seja, a nova categoria criada pelo usuario aparecera na lista de categorias automaticamente após ser criada
            });

            setOpen((prev)=> !prev);                // depois de criarmos a categoria, fecharemos o popover
        },
        onError: () => {
            toast.error("Algo deu errado!", {
                id: "criar-categoria",
            })
        }
    });

    const onSubmit = useCallback((values: CriarCategoriaSchemaTipo) => {    // quando enviarmos o formulário, mostraremos um toast de loading e chamaremos a função de mutação
        toast.loading("Criando categoria...", {
            id: "criar-categoria",
        });

        mutate(values);                             // a função mutate receberá como parâmetros os valores do formulário  
    }, [mutate]);


    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            { trigger ? trigger : <Button variant={"ghost"} className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground">
                <PlusSquareIcon size={24} className="mr-2 h-4 w-4" />
                Criar nova
            </Button> }
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Criar <span className={cn("m-1", tipo==="entrada" ? "text-emerald-500" : "text-rose-500")}>categoria de {tipo}</span>
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField  
                    control={form.control}
                    name="nome"
                    render={({ field }) => 
                        <FormItem>
                            <FormLabel>
                                Nome
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Categoria" {...field} />
                            </FormControl>
                            <FormDescription>
                                Sua categoria ficará assim no app!
                            </FormDescription>
                        </FormItem>
                    }
                />

                <FormField  
                    control={form.control}
                    name="icone"
                    render={({ field }) => 
                        <FormItem>
                            <FormLabel>
                                Ícone
                            </FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className="h-[100px] w-full">
                                            {form.watch("icone") ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-5xl" role="img">{field.value}</span>
                                                    <p className="text-xs text-muted-foreground">Clique para mudar o emoji</p>
                                                </div>
                                            ) : <div className="flex flex-col items-center gap-2">
                                                    <CircleOff className="h-[48px] w-[48px]" />
                                                    <p className="text-xs text-muted-foreground">Clique para selecionar um emoji</p>
                                                </div>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full">
                                        <Picker data={data} theme={tema.resolvedTheme}
                                        onEmojiSelect={(emoji: {native: string}) => {
                                            field.onChange(emoji.native)
                                        }}
                                        />                  
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormDescription>
                                Escolha um ícone para sua categoria!
                            </FormDescription>
                        </FormItem>
                    }
                />
                </form>
            </Form>
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
        </DialogContent>
    </Dialog>
}

export default DialogoCriarCategoria;