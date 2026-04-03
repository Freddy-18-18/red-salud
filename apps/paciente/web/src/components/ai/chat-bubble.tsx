"use client";

import { Bot, User } from "lucide-react";

import type { Message } from "@/lib/services/ai-assistant-service";

// --- Markdown Renderer ---

/**
 * Minimal markdown-to-JSX renderer for AI responses.
 * Supports: bold, italic, headers, lists, tables, line breaks, warning blocks.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection: line starts with |
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      nodes.push(renderTable(tableLines, nodes.length));
      continue;
    }

    // Empty line → spacing
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={nodes.length} className="font-semibold text-sm mt-3 mb-1">
          {renderInline(line.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={nodes.length} className="font-semibold text-sm mt-3 mb-1">
          {renderInline(line.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }

    // Unordered list items
    if (line.trim().startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      nodes.push(
        <ul key={nodes.length} className="list-disc list-inside space-y-0.5 my-1 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol key={nodes.length} className="list-decimal list-inside space-y-0.5 my-1 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={nodes.length} className="text-sm my-1">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return nodes;
}

/**
 * Render inline markdown: **bold**, *italic*, `code`, and emoji.
 */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // Italic
      parts.push(
        <em key={`i-${match.index}`}>
          {match[3]}
        </em>,
      );
    } else if (match[4]) {
      // Code
      parts.push(
        <code
          key={`c-${match.index}`}
          className="bg-gray-200/60 px-1 py-0.5 rounded text-xs font-mono"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Render a markdown table as an HTML table.
 */
function renderTable(lines: string[], keyPrefix: number): React.ReactNode {
  const rows = lines
    .filter((line) => !line.trim().match(/^\|[\s-:|]+\|$/)) // Skip separator row
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );

  if (rows.length === 0) return null;

  const [header, ...body] = rows;

  return (
    <div key={keyPrefix} className="overflow-x-auto my-2">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr className="border-b border-gray-300">
            {header.map((cell, idx) => (
              <th key={idx} className="px-2 py-1 text-left font-semibold">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-200/60">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-2 py-1">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Format Timestamp ---

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// --- Component ---

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
          isUser
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-sm">{renderMarkdown(message.content)}</div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-1.5 ${
            isUser ? "text-emerald-200" : "text-gray-400"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// --- Typing Indicator ---

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600">
        <Bot className="h-4 w-4" />
      </div>

      {/* Dots */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5 h-5">
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
