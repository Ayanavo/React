import React from "react";
import { parseSummaryBlocks } from "@/shared/utils/summary-blocks";

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

export default function SummaryContent({ content }: { content: string }) {
  const blocks = parseSummaryBlocks(content);

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
