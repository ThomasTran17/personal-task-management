import * as React from 'react';

// Custom hook for inline title editing
export interface UseTitleEditReturn {
  isEditing: boolean;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleStartEdit: () => void;
  handleEditChange: (value: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useTitleEdit(
  initialTitle: string,
  onSave?: (newTitle: string) => void
): UseTitleEditReturn {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(initialTitle);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleStartEdit = React.useCallback(() => {
    setIsEditing(true);
    setEditValue(initialTitle);
    // Focus input on next render
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, [initialTitle]);

  const handleEditChange = React.useCallback((value: string) => {
    setEditValue(value);
  }, []);

  const handleSave = React.useCallback(() => {
    if (editValue.trim() && editValue.trim() !== initialTitle) {
      onSave?.(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, initialTitle, onSave]);

  const handleCancel = React.useCallback(() => {
    setEditValue(initialTitle);
    setIsEditing(false);
  }, [initialTitle]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  return {
    isEditing,
    editValue,
    inputRef,
    handleStartEdit,
    handleEditChange,
    handleSave,
    handleCancel,
    handleKeyDown,
  };
}
