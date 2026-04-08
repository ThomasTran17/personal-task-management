import React from 'react';
import { AvatarDisplay } from './AvatarDisplay';

interface IAvatarStackProps {
  avatars: {
    id: string;
    avatarUrl?: string;
    name: string;
  }[];
  maxDisplay?: number;
  size?: number;
  overlapOffset?: number;
}

export const AvatarStack: React.FC<IAvatarStackProps> = ({
  avatars,
  maxDisplay = 3,
  size = 32,
  overlapOffset = 12,
}) => {
  const displayedAvatars = avatars.slice(0, maxDisplay);
  const remainingCount = Math.max(0, avatars.length - maxDisplay);

  return (
    <div className="flex items-center">
      <div className="flex items-center" style={{ marginRight: size / 2 }}>
        {displayedAvatars.map((avatar, index) => (
          <div
            key={avatar.id}
            style={{
              marginLeft: index === 0 ? 0 : -overlapOffset,
              zIndex: displayedAvatars.length - index,
              border: '2px solid white',
              borderRadius: '50%',
            }}
          >
            <AvatarDisplay avatarUrl={avatar.avatarUrl} name={avatar.name} size={size} />
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <span
          className="text-sm font-medium text-gray-600 ml-1"
          style={{ marginLeft: overlapOffset / 2 }}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};
