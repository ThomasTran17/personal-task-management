import { useState, useCallback } from 'react';
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components';
import type { TaskStatus, TaskPriority } from '@/types';
import { Search, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterStatus: (status: TaskStatus | 'all') => void;
  onFilterPriority: (priority: TaskPriority | 'all') => void;
  searchValue: string;
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';
  onAddTask: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

export default function SearchAndFilter({
  onSearch,
  onFilterStatus,
  onFilterPriority,
  searchValue,
  filterStatus,
  filterPriority,
  onAddTask,
}: SearchAndFilterProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters =
    searchValue.trim() !== '' || filterStatus !== 'all' || filterPriority !== 'all';

  const handleClearFilters = useCallback(() => {
    onSearch('');
    onFilterStatus('all');
    onFilterPriority('all');
  }, [onSearch, onFilterStatus, onFilterPriority]);

  return (
    <div className="mb-8 space-y-4 w-full">
      {/* Search Bar and Filters Toggle Row - Mobile */}
      <div className="flex items-center gap-4 lg:hidden">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 size-5 text-foreground/50 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tasks by title..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 border-2 border-border rounded-base bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          />
        </div>

        {/* Filters Toggle Button - Mobile Only */}
        <Button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          variant="neutral"
          className="flex items-center justify-center gap-2 flex-shrink-0 px-3"
        >
          {isFiltersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {/* Search Bar and Add Button Row - Desktop */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-3 size-5 text-foreground/50 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tasks by title..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 border-2 border-border rounded-base bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          />
        </div>

        {/* Add Task Button */}
        <Button
          onClick={onAddTask}
          variant="default"
          className="flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="size-5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Floating Circle Add Task Button - Mobile Only */}
      <div className="fixed bottom-18 right-6 lg:hidden">
        <Button
          onClick={onAddTask}
          variant="default"
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <Plus className="size-6" />
        </Button>
      </div>

      {/* Filters Row */}
      <div
        className={cn(
          'grid gap-4 transition-all duration-300 overflow-visible',
          isFiltersOpen
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'hidden lg:grid lg:grid-cols-3'
        )}
      >
        {/* Status Filter - Hidden on Mobile (Tab view handles it) */}
        <div className="hidden lg:block space-y-2">
          <label className="text-sm font-medium">Filter by Status</label>
          <Select
            value={filterStatus}
            onValueChange={(value) => onFilterStatus(value as TaskStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Priority</label>
          <Select
            value={filterPriority}
            onValueChange={(value) => onFilterPriority(value as TaskPriority | 'all')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              onClick={handleClearFilters}
              variant="neutral"
              className="w-full flex items-center justify-center gap-2"
            >
              <X className="size-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
