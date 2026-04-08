import { useSelector, useDispatch } from 'react-redux';
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
import { setSearchQuery, updateFilters, selectTaskFilters, selectFilteredTasks } from '@/store';
import { useSearchParams } from 'react-router-dom';

type ViewMode = 'kanban' | 'list';

const VIEW_COMPONENTS = {
  kanban: KanbanBoard,
  list: TaskList,
} as const;

const VALID_MODES: ViewMode[] = ['kanban', 'list'];
const DEFAULT_MODE: ViewMode = 'kanban';

export default function ListPage() {
  const dispatch = useDispatch();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [parentTaskForEdit, setParentTaskForEdit] = useState<Task | null>(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') as ViewMode;
  const viewMode: ViewMode = VALID_MODES.includes(queryMode) ? queryMode : DEFAULT_MODE;

  const { isLoading, error } = useGetTasksQuery();
  const filteredTasks = useSelector(selectFilteredTasks);
  const { searchQuery, status, priority } = useSelector(selectTaskFilters);

  const [deleteTask] = useDeleteTaskMutation();

  const handleSearch = (val: string) => dispatch(setSearchQuery(val));

  const handleFilterStatus = (val: TaskStatus | 'all') => {
    dispatch(updateFilters({ status: val === 'all' ? null : val }));
  };

  const handleFilterPriority = (val: TaskPriority | 'all') => {
    dispatch(updateFilters({ priority: val === 'all' ? null : val }));
  };

  // Fetch tasks at parent level (Lift State Up)

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
          onSearch={handleSearch}
          onFilterStatus={handleFilterStatus}
          onFilterPriority={handleFilterPriority}
          searchValue={searchQuery ?? ''}
          filterStatus={status ?? 'all'}
          filterPriority={priority ?? 'all'}
          onAddTask={() => setIsAddDialogOpen(true)}
          viewMode={viewMode}
        />
      </div>

      {/* Conditional Rendering based on viewMode */}
      <ActiveView
        tasks={filteredTasks}
        _isLoading={isLoading}
        _error={error}
        filterStatus={status ?? 'all'}
        onFilterStatusChange={handleFilterStatus}
        onEditTask={(task) => {
          setSelectedTaskForEdit(task);
          // Find parent task if editing a subtask
          const parentTask = filteredTasks.find((t) => t.subtasks?.some((st) => st.id === task.id));
          setParentTaskForEdit(parentTask ?? null);
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
        parentTask={parentTaskForEdit}
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
