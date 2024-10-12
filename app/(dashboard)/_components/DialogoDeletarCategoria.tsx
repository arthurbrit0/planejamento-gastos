"use client";

import { Categoria } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { ReactNode } from 'react'
import { DeletarCategoria } from '../_actions/categorias';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { TipoTransacao } from '@/lib/tipos';

interface Props {
    trigger: ReactNode;
    categoria: Categoria;
}

function DialogoDeletarCategoria({categoria, trigger}: Props) {

    const idCategoria = `${categoria.nome}-${categoria.tipo}`;

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeletarCategoria,
        onSuccess: async () => {
          toast.success("Categoria deletada com sucesso!", {
            id: idCategoria,
          });

          await queryClient.invalidateQueries({
            queryKey: ["categorias"]
          })
        },
        onError: () => {
          toast.error("Algo deu errado!", {
            id: idCategoria,
          })
        }
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Você tem certeza que deseja deletar a categoria?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Sua categoria será deletada permanentemente!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            toast.loading("Deletando categoria...", {
              id: idCategoria,
            })
            
            deleteMutation.mutate({
              nome: categoria.nome,
              tipo: categoria.tipo as TipoTransacao,
            })
          }}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DialogoDeletarCategoria
