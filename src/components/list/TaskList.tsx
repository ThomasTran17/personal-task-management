import { useMemo, useState } from 'react';
import React from 'react';
import { useGetTasksQuery, useDeleteTaskMutation } from '@/api';
import type { TaskPriority, TaskStatus } from '@/types';
import type { Task } from '@/types/task';
import { sortTasksByDeadline } from '@/lib';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ExpandableTaskRow,
  SubtaskContainer,
  SubtaskTableHeader,
  SubtaskTableRow,
  AddTaskRow,
} from '@/components/ui';

// Mock subtask type for testing UI hierarchy
interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

// Mock data for testing table with subtasks and visual connectors
const MOCK_SUBTASKS_MAP: Record<string, Subtask[]> = {
  'task-1': [
    { id: 'sub-1-1', title: 'Design database schema', status: 'DONE', priority: 'HIGH' },
    { id: 'sub-1-2', title: 'Setup API endpoints', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'sub-1-3', title: 'Write unit tests', status: 'TODO', priority: 'MEDIUM' },
  ],
  'task-2': [
    { id: 'sub-2-1', title: 'Create login form', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'sub-2-2', title: 'Add password validation', status: 'TODO', priority: 'MEDIUM' },
  ],
};

export default function TaskList() {
  const { data: tasksFromApi = [] } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['task-1', 'task-2']));

  // Mock tasks for UI demonstration
  const MOCK_TASKS: Task[] = [
    {
      id: 'task-1',
      title: 'Setup Project Infrastructure',
      description: 'Initialize database, API setup, and deployment pipeline',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date('2026-03-15'),
      updatedAt: new Date('2026-03-20'),
      dueDate: new Date('2026-04-05'),
    },
    {
      id: 'task-2',
      title: 'Implement User Authentication',
      description: 'Login, registration, password reset functionality',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date('2026-03-18'),
      updatedAt: new Date('2026-03-25'),
      dueDate: new Date('2026-04-10'),
    },
    {
      id: 'task-3',
      title: 'Design Dashboard UI',
      description: 'Create responsive dashboard with analytics',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date('2026-03-20'),
      updatedAt: new Date('2026-03-20'),
      dueDate: new Date('2026-04-15'),
    },
    {
      id: 'task-4',
      title: 'Write API Documentation',
      description: 'Document all endpoints and authentication flows',
      status: 'TODO',
      priority: 'LOW',
      createdAt: new Date('2026-03-22'),
      updatedAt: new Date('2026-03-22'),
      dueDate: new Date('2026-04-20'),
    },
    {
      id: 'task-5',
      title: 'Deploy to Production',
      description: 'Setup CI/CD pipeline and deploy application',
      status: 'DONE',
      priority: 'HIGH',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-03-10'),
      dueDate: new Date('2026-03-10'),
    },
  ];

  // Use mock data if API data is empty, otherwise use API data
  const tasks = tasksFromApi.length > 0 ? tasksFromApi : MOCK_TASKS;

  const filteredAndSortedTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return sortTasksByDeadline(result);
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId).unwrap();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle subtask expansion state
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Get subtasks for a task ID from mock map
  const getSubtasks = (taskId: string): Subtask[] => {
    return MOCK_SUBTASKS_MAP[taskId] || [];
  };

  return (
    <div className="w-full min-h-screen bg-background p-6 pb-24 lg:pb-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Danh sách công việc</h1>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-4 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="TODO">TO DO</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="DONE">Hoàn thành</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả mức độ ưu tiên</option>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
            </select>
          </div>
        </div>

        {/* Task Table */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">Không có công việc nào</p>
          </div>
        ) : (
          <div>
            <Table className="border-l-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Tiêu đề</TableHead>
                  <TableHead className="w-[20%]">Mô tả</TableHead>
                  <TableHead className="w-[15%]">Trạng thái</TableHead>
                  <TableHead className="w-[15%]">Ưu tiên</TableHead>
                  <TableHead className="w-[15%]">Hạn chót</TableHead>
                  <TableHead className="w-[15%] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task) => {
                  const subtasks = getSubtasks(task.id);
                  const isExpanded = expandedTasks.has(task.id);
                  const hasSubtasks = subtasks.length > 0;

                  return (
                    <React.Fragment key={task.id}>
                      {/* Parent Task Row - Neobrutalism with primary sidebar border */}
                      <ExpandableTaskRow
                        hasSubtasks={hasSubtasks}
                        isExpanded={isExpanded}
                        onToggleSubtasks={() => toggleExpanded(task.id)}
                        status={task.status}
                      >
                        <TableCell className="font-semibold text-gray-900">{task.title}</TableCell>
                        <TableCell className="text-gray-600 truncate">
                          {task.description ?? '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                          >
                            {task.status === 'TODO'
                              ? 'TO DO'
                              : task.status === 'IN_PROGRESS'
                                ? 'Đang thực hiện'
                                : 'Hoàn thành'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority === 'HIGH'
                              ? 'Cao'
                              : task.priority === 'MEDIUM'
                                ? 'Trung bình'
                                : 'Thấp'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="default" size="sm">
                                Xóa
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa công việc này? Thao tác này không thể
                                  hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex gap-2 justify-end">
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    void handleDeleteTask(task.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </ExpandableTaskRow>

                      {/* Subtasks Container - L-shaped visual connectors */}
                      {hasSubtasks && isExpanded && (
                        <TableRow className="border-b-0 border-l-0">
                          <TableCell colSpan={7} className="p-0">
                            <SubtaskContainer
                              isLast={subtasks.length === 1}
                              parentStatus={task.status}
                            >
                              {/* Subtask Table Headers */}
                              <table className="w-full">
                                <SubtaskTableHeader>
                                  <TableRow>
                                    <TableHead className="w-[30%] text-xs">Subtask</TableHead>
                                    <TableHead className="w-[20%] text-xs">Trạng thái</TableHead>
                                    <TableHead className="w-[20%] text-xs">Ưu tiên</TableHead>
                                    <TableHead className="w-[30%] text-xs"></TableHead>
                                  </TableRow>
                                </SubtaskTableHeader>
                                <TableBody>
                                  {subtasks.map((subtask, index) => (
                                    <SubtaskTableRow
                                      key={subtask.id}
                                      isLast={index === subtasks.length - 1}
                                      status={subtask.status}
                                      parentStatus={task.status}
                                      // className={index === 1 ? 'relative' : ''}
                                    >
                                      <TableCell className="text-sm">{subtask.title}</TableCell>
                                      <TableCell>
                                        <span
                                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status)}`}
                                        >
                                          {subtask.status === 'TODO'
                                            ? 'TO DO'
                                            : subtask.status === 'IN_PROGRESS'
                                              ? 'Thực hiện'
                                              : 'Xong'}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(subtask.priority)}`}
                                        >
                                          {subtask.priority === 'HIGH'
                                            ? 'Cao'
                                            : subtask.priority === 'MEDIUM'
                                              ? 'TB'
                                              : 'Thấp'}
                                        </span>
                                      </TableCell>
                                      <TableCell></TableCell>
                                    </SubtaskTableRow>
                                  ))}
                                  {/* Add Subtask Button */}
                                  <AddTaskRow
                                    onAddClick={() => console.warn('Add subtask clicked')}
                                  />
                                </TableBody>
                              </table>
                            </SubtaskContainer>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
