import { useEffect, useState } from 'react';
import {
  KanbanBoard,
  TaskList,
  SearchAndFilter,
  AddTaskDialog,
  EditTaskDialog,
} from '@/components';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { useGetTasksQuery, useDeleteTaskMutation } from '@/api';
import { Grid3x3, List } from 'lucide-react';
import type { TaskStatus, TaskPriority, Task } from '@/types';
import { useSearchParams } from 'react-router-dom';

type ViewMode = 'kanban' | 'list';

const VIEW_COMPONENTS = {
  kanban: KanbanBoard,
  list: TaskList,
} as const;

const VALID_MODES: ViewMode[] = ['kanban', 'list'];
const DEFAULT_MODE: ViewMode = 'kanban';

export default function ListPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') as ViewMode;
  const viewMode: ViewMode = VALID_MODES.includes(queryMode) ? queryMode : DEFAULT_MODE;

  const [deleteTask] = useDeleteTaskMutation();

  // Fetch tasks at parent level (Lift State Up)
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();

  const ActiveView = VIEW_COMPONENTS[viewMode];

  const handleViewChange = (newMode: string) => {
    setSearchParams((prev) => {
      prev.set('mode', newMode);
      return prev;
    });
  };

  useEffect(() => {
    const currentMode = searchParams.get('mode');

    if (!currentMode || !VALID_MODES.includes(currentMode as ViewMode)) {
      setSearchParams(
        (prev) => {
          prev.set('mode', DEFAULT_MODE);
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 pl-12 lg:pl-0">
        {/* View Mode Switcher */}
        <Tabs value={viewMode} onValueChange={handleViewChange}>
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
          onAddTask={() => setIsAddDialogOpen(true)}
          viewMode={viewMode}
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
        onEditTask={(task) => {
          setSelectedTaskForEdit(task);
          setIsEditDialogOpen(true);
        }}
        onDeleteTask={(task) => {
          setSelectedTaskForDelete(task);
          setIsDeleteDialogOpen(true);
        }}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={selectedTaskForEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTaskForDelete) {
                  void deleteTask(selectedTaskForDelete.id);
                  setIsDeleteDialogOpen(false);
                  setSelectedTaskForDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
