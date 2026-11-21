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

type ListKind = 'unordered' | 'ordered';

/** Safe, small Markdown-style renderer for EDUKEN-authored content. */
export default function RichContent({ text = '', className }: Props) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let listKind: ListKind = 'unordered';

  const flushList = () => {
    if (!list.length) return;
    const items = list.map((item, index) => (
      <li key={index}>{inline(item, 'li-' + index + '-')}</li>
    ));
    blocks.push(listKind === 'ordered'
      ? <ol key={'list-' + blocks.length}>{items}</ol>
      : <ul key={'list-' + blocks.length}>{items}</ul>);
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

    // Treat short, standalone all-caps labels as section headings without
    // changing their wording. Long or sentence-like lines remain paragraphs.
    const letters = line.replace(/[^A-Za-z]/g, '');
    const isCapsHeading =
      letters.length >= 3 &&
      letters.length <= 72 &&
      line.length <= 88 &&
      line.split(/\s+/).length <= 12 &&
      letters === letters.toUpperCase() &&
      !/[.!?]$/.test(line) &&
      !/^\d/.test(line);

    if (isCapsHeading) {
      flushList();
      blocks.push(<h3 key={'caps-heading-' + index}>{inline(line, 'caps-' + index + '-')}</h3>);
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^\d{1,3}[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const nextKind: ListKind = numbered ? 'ordered' : 'unordered';
      if (list.length && listKind !== nextKind) flushList();
      listKind = nextKind;
      list.push((bullet || numbered)![1]);
      return;
    }

    flushList();
    blocks.push(<p key={'paragraph-' + index}>{inline(line, 'p-' + index + '-')}</p>);
  });

  flushList();
  return <div className={className || 'rich-content'}>{blocks}</div>;
}
