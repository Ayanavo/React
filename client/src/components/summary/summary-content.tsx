import React from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <mark key={`${keyPrefix}-hl-${partIndex++}`} className="summary-content__highlight">
        {match[1]}
      </mark>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (currentList) {
      blocks.push({ type: currentList.type, items: currentList.items });
      currentList = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2].trim() });
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1].trim());
      continue;
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numberedMatch[1].trim());
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line.trim() });
  }

  flushList();
  return blocks;
}

export default function SummaryContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return <p>{"\u00A0"}</p>;
  }

  return (
    <div className="summary-content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level <= 2 ? "h3" : "h4";
          return (
            <Tag key={index} className={`summary-content__heading summary-content__heading--l${block.level}`}>
              {renderInline(block.text, `h-${index}`)}
            </Tag>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={index} className="summary-content__list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `ul-${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={index} className="summary-content__list summary-content__list--ordered">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `ol-${index}-${itemIndex}`)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="summary-content__paragraph">
            {renderInline(block.text, `p-${index}`)}
          </p>
        );
      })}
    </div>
  );
}
