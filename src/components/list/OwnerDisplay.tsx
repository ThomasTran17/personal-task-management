import React from 'react';
import { useGetUsersQuery } from '@/api';
import { AvatarDisplay } from '@/components/shared';

interface OwnerDisplayProps {
  ownerId: string;
  className?: string;
}

/**
 * Display task/subtask owner information
 * Shows owner's avatar and name
 * If owner not found, displays the ID
 *
 * @param ownerId - ID of the task owner
 * @param className - Optional CSS class for styling
 */
export function OwnerDisplay({ ownerId, className = '' }: OwnerDisplayProps) {
  const { data: users = [] } = useGetUsersQuery();

  const owner = users.find((u) => u.id === ownerId);

  // Get user display name
  const getOwnerDisplayName = (): string => {
    if (!owner) return ownerId;
    const fullName = `${owner.firstName} ${owner.lastName}`.trim();
    return fullName || owner.email || owner.id;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AvatarDisplay avatarUrl={owner?.avatar} name={getOwnerDisplayName()} size={24} />
      <span className="text-sm text-gray-700 truncate">{getOwnerDisplayName()}</span>
    </div>
  );
}
