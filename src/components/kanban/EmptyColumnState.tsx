import { TaskStatus } from '@/types/task';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface EmptyColumnStateProps {
  status: TaskStatus;
  isFiltered?: boolean;
}

export default function EmptyColumnState({ status, isFiltered }: EmptyColumnStateProps) {
  const getEmptyStateContent = () => {
    switch (status) {
      case 'todo':
        return {
          icon: AlertCircle,
          title: 'No Tasks',
          description: isFiltered ? 'No matching tasks to do' : 'Ready to add your first task?',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          iconColor: 'text-red-400',
        };
      case 'in-progress':
        return {
          icon: Clock,
          title: 'Nothing Started',
          description: isFiltered ? 'No matching tasks in progress' : 'Move a task here to get started',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-400',
        };
      case 'done':
        return {
          icon: CheckCircle2,
          title: 'No Completed Tasks',
          description: isFiltered ? 'No matching completed tasks' : 'Finish tasks to celebrate here',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          iconColor: 'text-green-400',
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Empty',
          description: 'No tasks here',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-400',
        };
    }
  };

  const { icon: Icon, title, description, bgColor, borderColor, textColor, iconColor } = getEmptyStateContent();

  return (
    <div className={`flex flex-col items-center justify-center w-full h-full min-h-48 ${bgColor} border-2 ${borderColor} rounded-lg p-6`}>
      {/* Icon */}
      <Icon className={`w-12 h-12 ${iconColor} mb-4`} strokeWidth={1.5} />

      {/* Title */}
      <h3 className={`text-lg font-bold ${textColor} mb-2`}>{title}</h3>

      {/* Description */}
      <p className={`${textColor} opacity-80 text-sm text-center max-w-xs`}>
        {description}
      </p>
    </div>
  );
}
