import { useState } from 'react';
import { KanbanBoard, TaskList, SearchAndFilter, AddTaskDialog } from '@/components';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useGetTasksQuery } from '@/api';
import { Grid3x3, List } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/types';

type ViewMode = 'kanban' | 'list';

const VIEW_COMPONENTS = {
  kanban: KanbanBoard,
  list: TaskList,
} as const;

export default function ListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Fetch tasks at parent level (Lift State Up)
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();

  const ActiveView = VIEW_COMPONENTS[viewMode];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 pl-12 lg:pl-0">
        {/* View Mode Switcher */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="kanban" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full flex items-center justify-between">
        <SearchAndFilter
          onSearch={setSearchQuery}
          onFilterStatus={setFilterStatus}
          onFilterPriority={setFilterPriority}
          searchValue={searchQuery}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
          onAddTask={() => setIsDialogOpen(true)}
        />
      </div>

      {/* Conditional Rendering based on viewMode */}
      <ActiveView
        tasks={tasks}
        _isLoading={isLoading}
        _error={error}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        onFilterStatusChange={setFilterStatus}
      />

      <AddTaskDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
