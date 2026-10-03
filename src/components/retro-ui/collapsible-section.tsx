import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  className = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`space-y-2 my-2 ${className}`}>
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-3 py-2.5 retro-button hover:bg-[var(--retro-accent)] transition-colors"
      >
        <h3 className="text-xs font-bold text-[var(--retro-text)] uppercase tracking-wider text-left flex-1">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--retro-text)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--retro-text)]" />
        )}
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="space-y-3 px-1 py-2">
          {children}
        </div>
      )}
    </div>
  );
}
