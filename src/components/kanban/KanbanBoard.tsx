import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskStore } from '@/store/taskStore';
import type { TaskStatus, TaskPriority } from '@/types/task';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import AddTaskDialog from '@/components/kanban/AddTaskDialog';
import SearchAndFilter from '@/components/kanban/SearchAndFilter';
import { sortTasksByDeadline } from '@/lib/deadlineHelpers';
import { usePeriodicDeadlineCheck } from '@/hooks/usePeriodicDeadlineCheck';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useTitleBadge } from '@/hooks/useTitleBadge';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

const COLUMNS = [
  { status: 'todo' as TaskStatus, label: 'TO DO', bgColor: 'bg-red-100' },
  { status: 'in-progress' as TaskStatus, label: 'IN PROGRESS', bgColor: 'bg-yellow-100' },
  { status: 'done' as TaskStatus, label: 'DONE', bgColor: 'bg-green-100' },
] as const;

export default function KanbanBoard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const { tasks, deleteTask } = useTaskStore();

  // Drag and drop hook
  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop();

  // Setup periodic deadline check (toast notifications)
  usePeriodicDeadlineCheck();

  // Setup browser notifications (web push)
  useBrowserNotifications();

  // Setup title badge with deadline count
  useTitleBadge();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter by title (case-insensitive)
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

      // Priority filter
      const matchesPriority =
        filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      const tasksByStatus = filteredTasks.filter((task) => task.status === status);
      // Sort by deadline for todo and in-progress, keep as-is for done
      if (status === 'todo' || status === 'in-progress') {
        return sortTasksByDeadline(tasksByStatus);
      }
      return tasksByStatus;
    },
    [filteredTasks]
  );

  return (
    <div className="w-full min-h-screen bg-background p-6 pb-24 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter */}
        <SearchAndFilter
          onSearch={setSearchQuery}
          onFilterStatus={setFilterStatus}
          onFilterPriority={setFilterPriority}
          searchValue={searchQuery}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
          onAddTask={() => setIsDialogOpen(true)}
        />

        {/* Desktop Grid View */}
        <div className="hidden lg:grid gap-6" style={{ gridTemplateColumns: `repeat(${filterStatus === 'all' ? 3 : 1}, minmax(0, 1fr))` }}>
          {COLUMNS.map((column) => {
            // Hide columns if specific status is filtered
            if (filterStatus !== 'all' && column.status !== filterStatus) {
              return null;
            }

            return (
              <KanbanColumn
                key={column.status}
                status={column.status}
                label={column.label}
                bgColor={column.bgColor}
                tasks={getTasksByStatus(column.status)}
                onDeleteTask={deleteTask}
                isFiltered={filterStatus !== 'all'}
                draggedTaskId={dragState.draggedTaskId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            );
          })}
        </div>

        {/* Mobile Tabs View */}
        <div className="lg:hidden">
          <Tabs 
            value={filterStatus === 'all' ? 'todo' : filterStatus} 
            onValueChange={(value) => setFilterStatus(value as TaskStatus)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {COLUMNS.map((column) => (
                <TabsTrigger key={column.status} value={column.status}>
                  {column.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {COLUMNS.map((column) => (
              <TabsContent key={column.status} value={column.status} className="mt-0">
                <KanbanColumn
                  status={column.status}
                  label={column.label}
                  bgColor={column.bgColor}
                  tasks={getTasksByStatus(column.status)}
                  onDeleteTask={deleteTask}
                  draggedTaskId={dragState.draggedTaskId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
