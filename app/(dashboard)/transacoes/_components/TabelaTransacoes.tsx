"use client";

import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react'
import { DataToUTCDate } from '@/lib/helpers';

import { 
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
 } from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { GetTransacoesResponseType } from '@/app/api/transacoes/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { DataTableColumnHeader } from '@/components/datatable/ColumnHeader';
import { cn } from '@/lib/utils';
import { DataTableFacetedFilter } from '@/components/datatable/FacetedFilters';
interface Props {
    from: Date;
    to: Date;
}

type HistoricoTransacaoRow = GetTransacoesResponseType[0]

const emptyData: any[] = [];

export const columns: ColumnDef<HistoricoTransacaoRow>[] = [

    {
        accessorKey: "categoria",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Categoria" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({row}) => ( 
            <div className="flex gap-2 capitalize">
                {row.original.iconeCategoria}
                <div className="capitalize">
                    {row.original.categoria}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "descricao",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Descrição" />
        ),
        cell: ({row}) => ( 
            <div className="capitalize">
                {row.original.descricao}
            </div>
        ),
    },
    {
        accessorKey: "data",
        header: "Data",
        cell: ({row}) => {
            const data = new Date(row.original.data);
            const formattedData = data.toLocaleDateString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });

            return <div className="text-muted-foreground">{formattedData}</div>
        },
    },
    {
        accessorKey: "tipo",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tipo" />
        ),
        cell: ({row}) => ( 
            <div className={cn("capitalze rounded-lg text-center p-2", row.original.tipo === "entrada" && "bg-emerald-400/10 text-emerald-500",
                row.original.tipo === "saida" && "bg-rose-400/10 text-rose-500")}>
                {row.original.tipo}
            </div>
        ),
    },
    {
        accessorKey: "valor",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Valor" />
        ),
        cell: ({row}) => ( 
            <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
                {row.original.valorFormatado}
            </p>
        ),
    },

]

function TabelaTransacoes({from, to}: Props) {

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const historicoTransacoes = useQuery<GetTransacoesResponseType>({
        queryKey: ['transacoes','historico', from, to],
        queryFn: async () => {
            const response = await fetch(`/api/transacoes?from=${DataToUTCDate(from)}&to=${DataToUTCDate(to)}`);
            const data = response.json();
            return data;
        }
    })

    const table = useReactTable({
        data: historicoTransacoes.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
    });

    const opcoesCategorias = useMemo(() => {
        const categorias = new Map();
        historicoTransacoes.data?.forEach((transacao) => {
            categorias.set(transacao.categoria, {
                value: transacao.categoria,
                label: `${transacao.iconeCategoria} ${transacao.categoria}`
            });
        });

        const categoriasUnicas = new Set(categorias.values());
        return Array.from(categoriasUnicas);
    },[historicoTransacoes.data])

  return (
    <div className="w-full">
        <div className="flex flex-wrap- items-end justify-between gap-2 py-4">
            <div className="flex gap-2">
                {table.getColumn("categoria") && (
                    <DataTableFacetedFilter title="Categoria" column={table.getColumn("categoria")} options={opcoesCategorias} />
                )}
            </div>
        </div>
        <SkeletonWrapper isLoading={historicoTransacoes.isFetching} >
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Sem resultados
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
        </SkeletonWrapper>
    </div>
  )
}

export default TabelaTransacoes
