import { useState, useRef, useEffect } from 'react';

interface UseReadMoreOptions {
  maxLines?: number;
  lineHeight?: number;
}

export const useReadMore = (content: string, options: UseReadMoreOptions = {}) => {
  const { maxLines = 4, lineHeight = 24 } = options;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  // Check if content needs truncation
  useEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        // Temporarily remove truncation to measure full height
        const element = contentRef.current;
        const originalStyle = element.style.cssText;
        
        // Set to full display to measure actual height
        element.style.display = 'block';
        element.style.webkitLineClamp = 'none';
        element.style.overflow = 'visible';
        element.style.whiteSpace = 'pre-line';
        
        const computedLineHeight = parseFloat(getComputedStyle(element).lineHeight) || lineHeight;
        const maxHeight = computedLineHeight * maxLines;
        const actualHeight = element.scrollHeight;
        
        // Restore original style
        element.style.cssText = originalStyle;
        
        setShowReadMore(actualHeight > maxHeight);
      }
    };

    // Use setTimeout to ensure the content is rendered
    const timer = setTimeout(checkTruncation, 0);
    return () => clearTimeout(timer);
  }, [content, maxLines, lineHeight]);

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };

  const getContentStyle = () => ({
    display: !isExpanded && showReadMore ? '-webkit-box' : 'block',
    WebkitLineClamp: !isExpanded && showReadMore ? maxLines : 'none',
    WebkitBoxOrient: 'vertical' as const,
    overflow: !isExpanded && showReadMore ? 'hidden' : 'visible',
    whiteSpace: !isExpanded && showReadMore ? 'normal' : 'pre-line'
  });

  return {
    isExpanded,
    showReadMore,
    contentRef,
    toggle,
    getContentStyle
  };
}; 