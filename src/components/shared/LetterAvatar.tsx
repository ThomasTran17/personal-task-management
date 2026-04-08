import React from 'react';

interface ILetterAvatarProps {
  name?: string;
  size?: number;
  customStyles?: React.CSSProperties;
}

/**
 * Generates a consistent color based on a string hash
 */
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 70;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const LetterAvatar: React.FC<ILetterAvatarProps> = ({
  name = '',
  size = 40,
  customStyles = {},
}) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  const backgroundColor = name ? stringToColor(name) : '#9CA3AF';
  const fontSize = size / 2.5;

  const defaultStyles: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize,
    fontFamily: 'sans-serif',
    color: '#FFFFFF',
    flexShrink: 0,
    ...customStyles,
  };

  return (
    <div style={defaultStyles} role="img" aria-label={name || 'avatar'}>
      {letter}
    </div>
  );
};
