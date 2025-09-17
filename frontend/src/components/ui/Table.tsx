// components/Table.tsx
"use client"

import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/helpers';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  MoreHorizontal, 
  Trophy,
  Medal,
  Award,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
// Types and Interfaces
export interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: (item: T) => boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: TableAction<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  variant?: 'default' | 'striped' | 'bordered' | 'gamified';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  exportable?: boolean;
  onExport?: () => void;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  actions,
  onRowClick,
  emptyMessage = "No data available",
  className,
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  exportable = false,
  onExport,
}: TableProps<T>) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering and sorting logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      columns
        .filter(col => col.searchable !== false)
        .some(col => 
          String(item[col.key])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Event handlers
  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedData.map((_, index) => index)));
    }
  };

  const handleSelectItem = (index: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedItems(newSelection);
  };

  // Style configurations
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const variantClasses = {
    default: 'bg-white border-gray-200',
    striped: 'bg-white border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    gamified: 'bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200',
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1: return <Medal className="h-4 w-4 text-gray-400" />;
      case 2: return <Award className="h-4 w-4 text-amber-600" />;
      default: return <span className="text-gray-500 font-bold">#{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner 
          variant="gamified" 
          size="lg" 
          text="Loading data..." 
        />
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Header with Search and Actions */}
      {(searchable || exportable) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            {exportable && onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className={cn(
          'w-full divide-y divide-gray-200',
          sizeClasses[size],
          variantClasses[variant]
        )}>
          {/* Header */}
          <thead className={cn(
            'bg-gray-50',
            variant === 'gamified' && 'bg-gradient-to-r from-blue-100 to-purple-100',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {variant === 'gamified' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
              )}
              
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {sortable && column.sortable !== false && (
                      <span className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'h-3 w-3 -mb-1',
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            'h-3 w-3',
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-300'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className={cn(
            'bg-white divide-y divide-gray-200',
            variant === 'striped' && '[&>tr:nth-child(even)]:bg-gray-50',
            variant === 'gamified' && '[&>tr:nth-child(even)]:bg-blue-50/30'
          )}>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0) + (variant === 'gamified' ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Filter className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-medium">No data found</p>
                      <p className="text-sm">{emptyMessage}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedItems.has(index) && 'bg-blue-50 border-blue-200',
                    variant === 'gamified' && 'hover:bg-purple-50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => handleSelectItem(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {variant === 'gamified' && (
                    <td className="px-6 py-4">
                      {getRankIcon((currentPage - 1) * pageSize + index)}
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.className
                      )}
                    >
                      {column.render 
                        ? column.render(item[column.key], item, index)
                        : String(item[column.key] || '-')
                      }
                    </td>
                  ))}
                  
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon || MoreHorizontal;
                          const isDisabled = action.disabled?.(item) || false;
                          
                          return (
                            <button
                              key={actionIndex}
                              onClick={() => !isDisabled && action.onClick(item)}
                              disabled={isDisabled}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                !isDisabled && {
                                  'primary': 'text-blue-600 hover:bg-blue-100',
                                  'secondary': 'text-gray-600 hover:bg-gray-100', 
                                  'success': 'text-green-600 hover:bg-green-100',
                                  'warning': 'text-yellow-600 hover:bg-yellow-100',
                                  'danger': 'text-red-600 hover:bg-red-100',
                                }[action.variant || 'secondary'],
                                isDisabled && 'text-gray-400 cursor-not-allowed'
                              )}
                              title={action.label}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i + 1));
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm',
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
