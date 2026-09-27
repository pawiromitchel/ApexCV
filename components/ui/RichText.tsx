import React from "react";

interface RichTextProps {
  content: string;
  className?: string;
}

const SAFE_URL = /^(https?:|mailto:|tel:)/i;

function safeHref(url: string): string | null {
  const trimmed = url.trim();
  if (SAFE_URL.test(trimmed)) return trimmed;
  // Bare domains like "example.com" are fine; anything with another scheme (javascript:, data:) is not
  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

/** Renders **bold**, *italic*, and [links](url) as React elements. User text is never parsed as HTML. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[1] !== undefined) {
      const href = safeHref(match[2]);
      nodes.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            {match[1]}
          </a>
        ) : (
          match[1]
        )
      );
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={key}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key}>{match[4]}</em>);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText({ content, className = "" }: RichTextProps) {
  if (!content) return null;
  return <span className={className}>{renderInline(content, "rt")}</span>;
}
