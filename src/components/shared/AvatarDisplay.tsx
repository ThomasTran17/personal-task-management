import React from 'react';
import { LetterAvatar } from './LetterAvatar';

interface IAvatarDisplayProps {
  avatarUrl?: string;
  name?: string;
  size?: number;
  customStyles?: React.CSSProperties;
}

export const AvatarDisplay: React.FC<IAvatarDisplayProps> = ({
  avatarUrl,
  name = '',
  size = 40,
  customStyles = {},
}) => {
  // If avatar URL exists, display it
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'avatar'}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          ...customStyles,
        }}
      />
    );
  }

  // Otherwise use LetterAvatar
  return <LetterAvatar name={name} size={size} customStyles={customStyles} />;
};
