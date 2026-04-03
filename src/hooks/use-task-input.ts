import * as React from 'react';

// Custom hook for task input state management
export interface UseTaskInputReturn {
  isEditing: boolean;
  inputValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleClick: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useTaskInput(
  onAddTask?: (title: string) => void,
  onAddClick?: () => void
): UseTaskInputReturn {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClick = React.useCallback(() => {
    setIsEditing(true);
    onAddClick?.();
  }, [onAddClick]);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSave = React.useCallback(() => {
    setInputValue((prevValue) => {
      if (prevValue.trim()) {
        onAddTask?.(prevValue);
        setIsEditing(false);
      }
      return prevValue;
    });
  }, [onAddTask]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setInputValue('');
        setIsEditing(false);
      }
    },
    [handleSave]
  );

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return {
    isEditing,
    inputValue,
    inputRef,
    handleClick,
    handleInputChange,
    handleSave,
    handleKeyDown,
  };
}
