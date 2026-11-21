import React from 'react';

type Props = { text?: string | null; className?: string };

function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={keyPrefix + index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={keyPrefix + index}>{part}</React.Fragment>;
  });
}

/** Safe, small Markdown-style renderer for EDUKEN-authored content. */
export default function RichContent({ text = '', className }: Props) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={'list-' + blocks.length}>
        {list.map((item, index) => <li key={index}>{inline(item, 'li-' + index + '-')}</li>)}
      </ul>
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) { flushList(); return; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const content = inline(heading[2], 'heading-' + index + '-');
      blocks.push(heading[1].length === 2
        ? <h3 key={'heading-' + index}>{content}</h3>
        : <h4 key={'heading-' + index}>{content}</h4>);
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) { list.push(bullet[1]); return; }
    flushList();
    blocks.push(<p key={'paragraph-' + index}>{inline(line, 'p-' + index + '-')}</p>);
  });
  flushList();
  return <div className={className || 'rich-content'}>{blocks}</div>;
}
