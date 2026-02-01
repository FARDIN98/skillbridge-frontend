/**
 * Base DataTable Component
 * Responsive table with TanStack Table
 * Desktop: Full table, Tablet: Simplified table, Mobile: Cards
 */

'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  mobileCard?: (data: TData) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  mobileCard,
  emptyMessage = 'No data available'
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <p className="text-lg text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-white' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-slate-500">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-white">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (<md) */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            {mobileCard ? (
              mobileCard(row.original)
            ) : (
              // Default card layout if no custom card provided
              <div className="space-y-2">
                {row.getVisibleCells().map((cell) => {
                  const header = cell.column.columnDef.header;
                  return (
                    <div key={cell.id} className="flex justify-between items-start gap-3">
                      <span className="text-sm text-slate-400 font-medium min-w-[100px]">
                        {typeof header === 'string' ? header : cell.column.id}:
                      </span>
                      <span className="text-sm text-white text-right flex-1">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination (if needed) */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Next
            </button>
          </div>

          <div className="text-sm text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
        </div>
      )}
    </div>
  );
}
