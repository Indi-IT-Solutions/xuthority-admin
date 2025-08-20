import React from 'react';
import { useReadMore } from '@/hooks/useReadMore';
import { cn } from '@/lib/utils';

interface ReadMoreTextProps {
  content: string;
  maxLines?: number;
  lineHeight?: number;
  className?: string;
  buttonClassName?: string;
  expandedButtonClassName?: string;
  readMoreText?: string;
  readLessText?: string;
  showArrows?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  children?: (content: string) => React.ReactNode;
}

const ReadMoreText: React.FC<ReadMoreTextProps> = ({
  content,
  maxLines = 4,
  lineHeight = 24,
  className = '',
  buttonClassName = '',
  expandedButtonClassName = '',
  readMoreText = 'Read more',
  readLessText = 'Read less',
  showArrows = true,
  onToggle,
  children
}) => {
  const { isExpanded, showReadMore, contentRef, toggle, getContentStyle } = useReadMore(content, {
    maxLines,
    lineHeight
  });

  const handleToggle = () => {
    toggle();
    onToggle?.(isExpanded);
  };

  return (
    <div>
      <div
        ref={contentRef as React.RefObject<HTMLDivElement>}
        className={className}
        style={getContentStyle()}
      >
        {children ? children(content) : content}
      </div>
      
      {showReadMore && (
        <button
          onClick={handleToggle}
          className={cn(
            "text-sm font-medium mt-2 transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer",
            "text-blue-600 hover:text-blue-800",
            buttonClassName,
            isExpanded && expandedButtonClassName
          )}
        >
          {isExpanded ? readLessText : readMoreText}
          {showArrows && (
            <span className="text-xs">
              {isExpanded ? "▲" : "▼"}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ReadMoreText; 