import React from 'react';

interface HighlightMatchProps {
  text: string;
  query: string;
  className?: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights matching search terms using crisp accessible JSX spans
 * without HTML string injection.
 */
export const HighlightMatch: React.FC<HighlightMatchProps> = React.memo(
  ({ text, query, className }) => {
    const trimmed = query.trim();
    if (!trimmed || !text) {
      return <span className={className}>{text}</span>;
    }

    const tokens = Array.from(
      new Set(
        trimmed
          .split(/\s+/)
          .map((t) => t.trim())
          .filter((t) => t.length >= 2)
      )
    );

    const patternStr =
      tokens.length > 0 ? tokens.map(escapeRegExp).join('|') : escapeRegExp(trimmed);

    if (!patternStr) {
      return <span className={className}>{text}</span>;
    }

    const regex = new RegExp(`(${patternStr})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, idx) => {
          const isMatch = idx % 2 === 1;
          if (!isMatch) return <React.Fragment key={idx}>{part}</React.Fragment>;
          return (
            <mark
              key={idx}
              className="bg-[#0284c7]/20 dark:bg-sky-400/25 text-[#0369a1] dark:text-sky-200 font-bold rounded px-0.5 not-italic"
            >
              {part}
            </mark>
          );
        })}
      </span>
    );
  }
);

HighlightMatch.displayName = 'HighlightMatch';
