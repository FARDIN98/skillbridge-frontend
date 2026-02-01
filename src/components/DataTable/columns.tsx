/**
 * Reusable Column Helper Functions
 * Common column definitions for DataTable
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';

/**
 * Create a badge column
 */
export function createBadgeColumn<T>(
  accessor: keyof T,
  header: string,
  colorMap: Record<string, { bg: string; text: string; border: string }>
): ColumnDef<T> {
  return {
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const colors = colorMap[value] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
          {value}
        </span>
      );
    },
  };
}

/**
 * Create a date column
 */
export function createDateColumn<T>(
  accessor: keyof T,
  header: string,
  format: 'date' | 'datetime' | 'relative' = 'date'
): ColumnDef<T> {
  return {
    accessorKey: accessor as string,
    header,
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return <span className="text-slate-500">—</span>;

      const date = new Date(value as string);

      if (format === 'relative') {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
      }

      if (format === 'datetime') {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  };
}

/**
 * Create an actions column
 */
export function createActionsColumn<T>(
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
  }>
): ColumnDef<T> {
  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => action.onClick(row.original)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 min-h-11 ${
              action.variant === 'danger'
                ? 'text-red-400 hover:bg-red-500/10 focus:ring-red-400'
                : 'text-slate-300 hover:text-white hover:bg-white/5 focus:ring-amber-400'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    ),
  };
}

/**
 * Common status color maps
 */
export const statusColorMaps = {
  booking: {
    CONFIRMED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    COMPLETED: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  },
  user: {
    ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    BANNED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  },
  role: {
    STUDENT: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    TUTOR: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    ADMIN: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  },
};
