import React, { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SkeletonWrapper = ({ // importando o Skeleton do shadcn-ui para criar um efeito de carregamento se estivermos dando fetch na api
    children,
    isLoading,
    fullWidth = true 
}: {
    children: ReactNode;
    isLoading: boolean;
    fullWidth?: boolean;
    }) => {
    
    if (!isLoading) return children // se não estiver carregando, renderizamos os filhos desse wrapper
    return <Skeleton className={cn(fullWidth && "w-full")}> {/* se estiver carregando, retornamos um skeleton */}
        <div className="opacity-0">{children}</div> {/* e renderizamos os filhos desse wrapper com opacidade 0, para que o skeleton tenha o mesmo tamanho do filho */}
    </Skeleton>


}

export default SkeletonWrapper