import React from 'react';
import { Plus, CircleUser } from 'lucide-react';

interface ParticipantsDisplayProps {
  participantIds?: string[];
  maxDisplay?: number;
}

/**
 * Display participants with @ prefix or show icons if empty
 * Format: @username1, @username2, ...
 * Empty state: Shows Plus and CircleUser icons
 *
 * @param participantIds - Array of participant IDs/usernames
 * @param maxDisplay - Maximum number of participants to display (default: 3)
 */
export function ParticipantsDisplay({
  participantIds = [],
  maxDisplay = 3,
}: ParticipantsDisplayProps) {
  if (!participantIds || participantIds.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Plus size={16} className="text-gray-400" />
        <CircleUser size={16} className="text-gray-400" />
      </div>
    );
  }

  const displayParticipants = participantIds.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, participantIds.length - maxDisplay);

  return (
    <span className="text-gray-700 text-sm">
      {displayParticipants.map((id, index) => (
        <React.Fragment key={id}>
          {index > 0 && ', '}
          <span className="font-medium">@{id}</span>
        </React.Fragment>
      ))}
      {hiddenCount > 0 && <span className="text-gray-500"> +{hiddenCount}</span>}
    </span>
  );
}
