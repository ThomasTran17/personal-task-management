import { useState } from 'react';
import { KanbanBoard, SearchAndFilter, AddTaskDialog } from '@/components';
import type { TaskStatus, TaskPriority } from '@/types';

export default function ListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SearchAndFilter
        onSearch={setSearchQuery}
        onFilterStatus={setFilterStatus}
        onFilterPriority={setFilterPriority}
        searchValue={searchQuery}
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        onAddTask={() => setIsDialogOpen(true)}
      />

      <KanbanBoard
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        onFilterStatusChange={setFilterStatus}
      />

      <AddTaskDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
