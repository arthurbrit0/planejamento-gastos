"use client";

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { TipoTransacao } from '@/lib/tipos'
import { Categoria } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandList, CommandItem } from '@/components/ui/command';
import DialogoCriarCategoria from './DialogoCriarCategoria';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useCallback } from 'react';

interface Props {
    tipo: TipoTransacao
    onChange: (categoria: string) => void
}

function EscolherCategoria({tipo, onChange }: Props) {

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if(!value) {
      return
    }
    onChange(value);
  }, [onChange, value])

  const categoriasQuery = useQuery({
    queryKey: ['categorias', tipo], // quando passamos um parametro na queryKey, quando o valor do param, no caso tipo, mudar, ocorrera um refetch na query
    queryFn: () => {
      return fetch(`/api/categorias?tipo=${tipo}`).then((res) => res.json()) // fazemos uma chamada para a api, para resgatar as categorias do usuario logado de acordo com o tipo passado no parametro
    }
  })

  const successCallback = (categoria: Categoria) => {
    setValue(categoria.nome)
    setOpen((prev) => !prev)
  }

  const categoriaSelecionada = useCallback(categoriasQuery.data?.find( // aqui, achamos o objeto categoria que tem o nome igual ao valor selecionado
    (categoria: Categoria) => categoria.nome === value // esse value sera definido no dropdown de categorias
  ),[setValue, setOpen]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"} role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {categoriaSelecionada ? <CategoryRow categoria={categoriaSelecionada} /> : "Escolha uma categoria"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-0"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command onSubmit={e => {
          e.preventDefault()
        }}>
          <CommandInput placeholder="Pesquisar categoria..."/>
          <DialogoCriarCategoria tipo={tipo} onSuccessCallback={successCallback}/>
          <CommandEmpty>
            <p>Categoria não encontrada</p>
            <p className="text-xs text-muted-foreground">
              Dica: crie uma nova categoria!
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {
                categoriasQuery.data && categoriasQuery.data.map((categoria: Categoria) =>
                  <CommandItem key={categoria.nome} onSelect={ () => {
                    setValue(categoria.nome)
                    setOpen((prev) => !prev)
                  }}>
                    <CategoryRow categoria={categoria} />
                    <Check className={cn(
                      "mr-2 w-4 h-4 opacity-0", value === categoria.nome && "opacity-100"
                    )}/>
                  </CommandItem>
                )
              }
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default EscolherCategoria

function CategoryRow({categoria}: {categoria: Categoria}) {
  return <div className="flex items-center gap-2">
    <span role="img">{categoria.icone}</span>
    <span>{categoria.nome}</span>
  </div>
}
