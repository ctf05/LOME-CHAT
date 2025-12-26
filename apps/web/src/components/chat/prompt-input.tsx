import * as React from 'react';
import { cn } from '@lome-chat/ui';
import { Send } from 'lucide-react';
import { Button } from '@lome-chat/ui';
import { Textarea } from '@lome-chat/ui';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

/**
 * Large prompt input with character counter, send button, and keyboard handling.
 * Used for the new chat page's main input area.
 */
export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask me anything...',
  maxLength = 2000,
  className,
  rows = 6,
  disabled = false,
}: PromptInputProps): React.JSX.Element {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isOverLimit = maxLength ? value.length > maxLength : false;
  const validLength = Math.min(value.length, maxLength);
  const overflowLength = Math.max(0, value.length - maxLength);

  const canSubmit = value.trim().length > 0 && !isOverLimit && !disabled;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  };

  const handleSubmitClick = (): void => {
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            'min-h-[150px] resize-none pr-14 pb-10 text-base',
            isOverLimit && 'border-destructive focus-visible:ring-destructive'
          )}
        />

        {/* Character counter */}
        <div
          data-testid="character-counter"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'absolute bottom-3 left-3 text-sm',
            isOverLimit ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {isOverLimit ? (
            <>
              <span>{validLength}</span>
              <span className="text-destructive">+{overflowLength}</span>
              <span>/{maxLength}</span>
            </>
          ) : (
            <span>
              {value.length}/{maxLength}
            </span>
          )}
        </div>

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          onClick={handleSubmitClick}
          disabled={!canSubmit}
          className="absolute right-3 bottom-3"
          aria-label="Send"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Over limit warning */}
      {isOverLimit && (
        <p className="text-destructive mt-2 text-sm">
          Characters beyond the {maxLength} character limit will not be included.
        </p>
      )}
    </div>
  );
}
