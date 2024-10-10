"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query" // utilizaremos o media query para definir o tamanho da tela e facilitar a responsividade
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Moeda, Moedas } from "@/lib/moedas" // usando o tipo Moeda e a lista de moedas que criamos
import { useQuery, useMutation } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { ConfiguracoesUser } from "@prisma/client"
import { UpdateMoedaUsuario } from "@/app/config/_actions/configuracoesUser"
import { toast } from "sonner"

/* 

Esse componente é importado do shadcn-ui, e serve como um dropdown de escolha de moedas  

*/

export function MoedaBox() { // função importada do shadcn ui (Combobox), que cria um dropdown de moedas
  const [open, setOpen] = React.useState(false) // utilizando o sstate open para verificar se o dropdown foi aberto
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Moeda | null>( // a opção selecionada será do tipo Moeda, que definimos no utils, ou não estará selecionada
    null
  )

  // USANDO O USEQUERY PARA PEGAR CONFIGURAÇÕES DO USUARIO DO BANCO DE DADOS

  const configuracoesUser = useQuery<ConfiguracoesUser>({ // usando o hook useQuery para pegar as configurações do usuário, com o tipo  do modelo ConfiguracoesUser
    queryKey: ["configuracoesUser"], // essa chave da query sera usada para identificar a query, tornando mais facil de ser referenciada
    queryFn: async () => { // função da query que buscará no banco de dados. faremos uma chamada para a api na rota configuracoes-user
      const response = await fetch("/api/configuracoes-user");
      const data = await response.json(); // a resposta, se tudo der certo, é um objeto com os dados da configuração do usuário
      return data; // retornamos as configurações do usuario. elas podem já estar criadas, no caso só retornaremos, ou então podem não estar setadas, e então criaremos com os valores default para depois retornar
    }
  })

  React.useEffect(() => { // usamos o useEffect com o array de dependencias setado com os dados de configuraçao do usuario. toda vez que elas mudarem, o useEffect será chamado
    if (!configuracoesUser) return; // se o usuario não tiver configurações, não retornaremos nada
    const moedaUsuario = Moedas.find( // se ele tiver alguma configuração, procuraremos no array Moedas a moeda que tem o mesmo valor da setada pelo usuario em sua cfg
      (moeda) => moeda.value === configuracoesUser.data?.moeda
    )

    if(configuracoesUser) setSelectedOption(moedaUsuario || null) // então, por fim, setaremos o estado da moeda selecionada com a moeda do usuario, ou null se ele não tiver setado
  }, [configuracoesUser.data])

  // USANDO USEMUTATION PARA ATUALIZAR CONFIGURAÇÕES DO USUARIO NO BANCO DE DADOS

  const mutation = useMutation({
    mutationFn: UpdateMoedaUsuario, // a função mutation utilizará a função de atualizar a moeda do usuario
    onSuccess: (data: ConfiguracoesUser ) => {
      toast.success("Moeda atualizada com sucesso!", { // se conseguirmos atualizar a moeda, mostraremos um toast de sucesso
        id: "atualizar-moeda",
      })
      setSelectedOption(
        Moedas.find((moeda) => moeda.value === data.moeda) || null // a opcao selecionada passará a ser a moeda presente no data, após comparar essa moeda com as presentes em Moedas
      )
    },
    onError: (e) => { // se não conseguirmos atualizar a moeda, lançaremos um toast de erro
      toast.error("Algo deu errado!", {
        id:"atualizar-moeda", // usamos o mesmo id de toast para todos os toasts para que, em caso de mudança no valor da moeda ou erro, o toast só seja atualizado e não tenhamos que criar um novo
      })
    }
  });

  const selecionarOpcao = React.useCallback((moeda: Moeda | null) => { // quando a função for chamada, esperará receber uma moeda (tipo Moeda) ou um valor nulo
    if (!moeda) {
      toast.error("Por favor, selecione uma moeda") // se não houver moeda, lançamos um toast de erro
      return;
    }

    toast.loading("Atualizando moeda...", { // setaremos um toast para carregar enquanto atualizamos a moeda
      id: "atualizar-moeda",
    })

    mutation.mutate(moeda.value) // função pegará a nova moeda selecionada pelo usuário e atualizar no banco de dados, já que a função pegará o moeda.value e passará como parâmetro para o UpdateMoedaUsuario, que é o mutationFn
  }, [mutation]);

  // =====================================================================================================================================

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={configuracoesUser.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start w-full" disabled={mutation.isPending}>
              {selectedOption ? <>{selectedOption.label}</> : <>+ Definir moeda</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selecionarOpcao} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={configuracoesUser.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="justify-start w-full" disabled={mutation.isPending}>
            {selectedOption ? <>{selectedOption.label}</> : <>+ Definir moeda</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selecionarOpcao} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  )
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (status: Moeda | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filtrar moedas..." />
      <CommandList>
        <CommandEmpty>Moeda não encontrada.</CommandEmpty>
        <CommandGroup>
          {Moedas.map((moeda: Moeda) => (
            <CommandItem
              key={moeda.value}
              value={moeda.value}
              onSelect={(value) => {
                setSelectedOption(
                  Moedas.find((priority) => priority.value === value) || null
                )
                setOpen(false)
              }}
            >
              {moeda.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
