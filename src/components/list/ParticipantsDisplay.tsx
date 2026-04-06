import React, { useState } from 'react';
import { Plus, CircleUser } from 'lucide-react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGetUsersQuery } from '@/api';
import type { UserWithAttributes } from '@/api';

interface ParticipantsDisplayProps {
  participantIds?: string[];
  maxDisplay?: number;
  onParticipantsChange?: (participantIds: string[]) => void;
  isEditable?: boolean;
}

/**
 * Display participants with @ prefix or show icons if empty
 * Format: @username1, @username2, ...
 * Empty state: Shows Plus and CircleUser icons
 *
 * When isEditable is true, clicking on it opens a combobox to select participants
 *
 * @param participantIds - Array of participant IDs/usernames
 * @param maxDisplay - Maximum number of participants to display (default: 3)
 * @param onParticipantsChange - Callback when participants are modified
 * @param isEditable - Whether to allow editing participants (default: false)
 */
export function ParticipantsDisplay({
  participantIds = [],
  maxDisplay = 3,
  onParticipantsChange,
  isEditable = false,
}: ParticipantsDisplayProps) {
  const [open, setOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participantIds);

  // Fetch list of users
  const { data: users = [] } = useGetUsersQuery();

  // Display content
  const displayContent = (
    <>
      {participantIds.length === 0 ? (
        <div className="flex items-center gap-1.5">
          <Plus size={16} className="text-gray-400" />
          <CircleUser size={16} className="text-gray-400" />
        </div>
      ) : (
        <span className="text-gray-700 text-sm">
          {participantIds.slice(0, maxDisplay).map((id, index) => (
            <React.Fragment key={id}>
              {index > 0 && ', '}
              <span className="font-medium">@{id}</span>
            </React.Fragment>
          ))}
          {Math.max(0, participantIds.length - maxDisplay) > 0 && (
            <span className="text-gray-500">
              {' '}
              +{Math.max(0, participantIds.length - maxDisplay)}
            </span>
          )}
        </span>
      )}
    </>
  );

  if (!isEditable) {
    return <>{displayContent}</>;
  }

  // Editable version with combobox
  const handleSelectParticipant = (userId: string) => {
    const newParticipants = selectedParticipants.includes(userId)
      ? selectedParticipants.filter((id) => id !== userId)
      : [...selectedParticipants, userId];

    setSelectedParticipants(newParticipants);
    onParticipantsChange?.(newParticipants);
  };

  // Get user display name
  const getUserDisplayName = (user: UserWithAttributes): string => {
    return user.displayName ?? user.firstName ?? user.email ?? user.id;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between md:max-w-[300px]"
        >
          <div className="flex-1 text-left overflow-hidden text-ellipsis">{displayContent}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) border-0 p-0">
        <Command className="**:data-[slot=command-input-wrapper]:h-11">
          <CommandInput placeholder="Search users..." />
          <CommandList className="p-1">
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => handleSelectParticipant(user.id)}
                >
                  {getUserDisplayName(user)}
                  <CheckIcon
                    className={cn(
                      'ml-auto',
                      selectedParticipants.includes(user.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
