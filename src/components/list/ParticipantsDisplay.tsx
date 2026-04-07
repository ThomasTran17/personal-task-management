import React, { useState, useEffect, useRef } from 'react';
import { Plus, CircleUser, ChevronsUpDown } from 'lucide-react';
import { CheckIcon } from 'lucide-react';
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
import { AvatarDisplay, AvatarStack } from '@/components/shared';
import type { UserResponseDto } from '@/api';

interface ParticipantsDisplayProps {
  participantIds?: string[];
  maxDisplay?: number;
  onParticipantsChange?: (participantIds: string[]) => void;
  isEditable?: boolean;
  hasBorder?: boolean;
}

/**
 * Display participants with @ prefix or show icons if empty
 * Format: @username1, @username2, ...
 * Empty state: Shows Plus and CircleUser icons
 *
 * When isEditable is true, clicking on it opens a combobox to select participants directly
 * (inline edit without needing to open a dialog)
 *
 * @param participantIds - Array of participant IDs/usernames
 * @param maxDisplay - Maximum number of participants to display (default: 3)
 * @param onParticipantsChange - Callback when participants are modified
 * @param isEditable - Whether to allow editing participants (default: false)
 * @param hasBorder - Whether to show a border around the component (default: false)
 */
export function ParticipantsDisplay({
  participantIds = [],
  maxDisplay = 3,
  onParticipantsChange,
  isEditable = false,
  hasBorder = false,
}: ParticipantsDisplayProps) {
  const [open, setOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participantIds);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<string[]>(participantIds);

  // Update ref when prop changes to keep track of actual participants
  useEffect(() => {
    lastCallRef.current = participantIds;
  }, [participantIds]);

  // Fetch list of users
  const { data: users = [] } = useGetUsersQuery();

  // Display content
  const displayContent = (
    <>
      {selectedParticipants.length === 0 ? (
        <div className="flex items-center gap-1.5 cursor-pointer">
          <Plus size={60} className="text-gray-400" />
          <CircleUser size={60} className="text-gray-400" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Plus size={60} className="text-gray-400" />

          <AvatarStack
            avatars={selectedParticipants.map((id) => {
              const user = users.find((u) => u.id === id);
              const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
              const displayName = fullName || (user?.email ?? id);
              return {
                id,
                avatarUrl: user?.avatar,
                name: displayName,
              };
            })}
            maxDisplay={maxDisplay}
            size={24}
          />
        </div>
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

    // Debounce the API call - wait 300ms before sending
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Only call if participants have actually changed
      if (JSON.stringify(newParticipants) !== JSON.stringify(lastCallRef.current)) {
        lastCallRef.current = newParticipants;
        onParticipantsChange?.(newParticipants);
      }
    }, 300);
  };

  // Get user display name
  const getUserDisplayName = (user: UserResponseDto): string => {
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return fullName || user.email || user.id;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn('bg-transparent', !hasBorder && 'border-none')}>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between md:max-w-[300px] p-0 no-padding px-2"
        >
          <div className="flex-1 text-left overflow-hidden text-ellipsis">{displayContent}</div>
          {hasBorder && <ChevronsUpDown size={16} className="ml-2 text-gray-400" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-0 p-0 ">
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
                  <div className="flex items-center gap-2 w-full">
                    <AvatarDisplay
                      avatarUrl={user.avatar}
                      name={getUserDisplayName(user)}
                      size={28}
                    />
                    <span>{getUserDisplayName(user)}</span>
                  </div>
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
