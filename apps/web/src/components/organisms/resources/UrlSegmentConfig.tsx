'use client';

import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

export interface UrlSegmentConfigProps {
  url: string;
  onSegmentClick?: (segment: string, index: number) => void;
}

const URL_REGEX = /^\/[a-zA-Z0-9\-_/.{}]+$/;

/**
 * UrlSegmentConfig - Parses a URL and renders each segment as a clickable button
 *
 * Validates the URL format, splits it into segments, and displays them
 * as pill-shaped buttons separated by `/` slashes.
 */
export function UrlSegmentConfig({ url, onSegmentClick }: UrlSegmentConfigProps) {
  const { segments, error } = useMemo(() => {
    const trimmed = url.trim();

    if (!trimmed || trimmed === '/') {
      return { segments: [], error: null };
    }

    if (!trimmed.startsWith('/')) {
      return { segments: [], error: 'URL must start with /' };
    }

    if (!URL_REGEX.test(trimmed)) {
      return { segments: [], error: 'URL contains invalid characters' };
    }

    const parts = trimmed.split('/').filter(Boolean);
    return { segments: parts, error: null };
  }, [url]);

  if (!url.trim() || url.trim() === '/') {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (segments.length === 0) {
    return null;
  }

  const isPlaceholder = (segment: string) => segment.startsWith('{') && segment.endsWith('}');

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-gray-300 text-sm">/</span>}
          <button
            type="button"
            onClick={() => onSegmentClick?.(segment, index)}
            className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
              isPlaceholder(segment)
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {segment}
          </button>
        </div>
      ))}
    </div>
  );
}

export default UrlSegmentConfig;
