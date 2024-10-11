"use client";

import { TipoTransacao } from "@/lib/tipos";
import { CriarCategoriaSchemaTipo, CriarCategoriaSchema } from "@/schema/categorias";
import React, { useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CircleOff, Divide, Loader2, PlusSquareIcon } from "lucide-react";
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
    tipo: TipoTransacao,
    onSuccessCallback: (categoria: Categoria) => void;
};

function DialogoCriarCategoria({tipo, onSuccessCallback }: Props) {

    const [open, setOpen] = React.useState(false);
    const form = useForm<CriarCategoriaSchemaTipo>({
        resolver: zodResolver(CriarCategoriaSchema),
        defaultValues: {
            tipo,
        }
    });

    const queryClient = useQueryClient();
    const tema = useTheme();

    const {mutate, isPending} = useMutation({
        mutationFn: CriarCategoria,
        onSuccess: async (data: Categoria) => {
            form.reset({
                nome: "",
                icone: "",
                tipo
            });

            toast.success(`Categoria ${data.nome} criada com sucesso!`, {
                id: "criar-categoria",
            });

            onSuccessCallback(data);

            await queryClient.invalidateQueries({
                queryKey: ["categorias"],
            });

            setOpen((prev)=> !prev);
        },
        onError: () => {
            toast.error("Algo deu errado!", {
                id: "criar-categoria",
            })
        }
    });

    const onSubmit = useCallback((values: CriarCategoriaSchemaTipo) => {
        toast.loading("Criando categoria...", {
            id: "criar-categoria",
        });

        mutate(values);
    }, [mutate]);


    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant={"ghost"} className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground">
                <PlusSquareIcon size={24} className="mr-2 h-4 w-4" />
                Criar nova
            </Button>
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