import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Send, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createOpenAI } from "@ai-sdk/openai";

type BubbleProps = {
  role: "user" | "assistant" | "system";
  children: React.ReactNode;
};

function Bubble({ role, children }: BubbleProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3 py-2 text-sm shadow",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border",
          isAssistant && "bg-card text-foreground border border-border"
        )}>
        {children}
      </div>
    </div>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const prevCountRef = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Scroll to latest message when panel is open and messages change
  useEffect(() => {
    if (!isOpen) return;
    const el = endRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen]);

  // Track unread assistant messages when closed
  useEffect(() => {
    const prevCount = prevCountRef.current;
    const nextCount = messages.length;

    if (!isOpen && nextCount > prevCount) {
      // Count new assistant messages since last seen
      const newMsgs = messages.slice(prevCount);
      const newAssistantCount = newMsgs.filter((m) => m.role === "assistant").length;
      if (newAssistantCount > 0) {
        setUnread((u) => Math.min(99, u + newAssistantCount));
      }
    }

    prevCountRef.current = nextCount;
  }, [messages, isOpen]);

  // Reset unread when opening
  useEffect(() => {
    if (isOpen) setUnread(0);
  }, [isOpen]);

  // Close on outside click by using a transient overlay
  const Overlay = useMemo(() => {
    if (!isOpen) return null;
    return <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/0" onClick={() => setIsOpen(false)} />;
  }, [isOpen]);

  // Controlled input for useChat v5 (no built-in input state)
  const [input, setInput] = useState("");
  const onSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status !== "ready") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <>
      {/* Overlay catches outside clicks when open */}
      {Overlay}

      {/* Chat Panel */}
      <section
        aria-live="polite"
        aria-label="AI Chat"
        className={cn("fixed right-4 bottom-20 z-50 w-[90vw] max-w-sm sm:max-w-md", isOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          className={cn(
            "flex h-[70vh] max-h-[560px] flex-col rounded-xl border border-border bg-card text-foreground shadow-xl transition-all",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          role="dialog"
          aria-modal="true">
          {/* Header */}
          <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot size={16} aria-hidden="true" />
              </span>
              <h2 className="text-sm font-medium text-pretty">May i help you?</h2>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close chat" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ?
              <div className="text-sm text-muted-foreground">Ask me anything. I can answer questions, summarize, and more.</div>
            : messages.map((m) => {
                // Render only text parts for simplicity
                const textParts = m.parts?.filter((p) => p.type === "text") ?? [];
                const text = textParts.map((p) => ("text" in p ? p.text : "")).join("\n");
                return (
                  <Bubble key={m.id} role={m.role}>
                    {text || (m.role === "system" ? "…" : "")}
                  </Bubble>
                );
              })
            }
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form onSubmit={onSend} className="flex items-center gap-2 p-3 border-t border-border bg-card">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              aria-label="Message"
              disabled={status === "submitted" || status === "streaming"}
              className="bg-background"
            />
            <Button type="submit" disabled={status === "submitted" || status === "streaming"} className="shrink-0">
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </form>
        </div>
      </section>

      {/* Floating Toggle Button */}
      <button
        type="button"
        aria-label={isOpen ? "Hide chat" : "Show chat"}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        )}>
        <Bot className="h-6 w-6" aria-hidden="true" />
        {/* Unread badge */}
        {unread > 0 && !isOpen && (
          <span
            aria-label={`${unread} new messages`}
            className="absolute -top-1 -right-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium leading-none text-destructive-foreground border border-border">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </>
  );
}

export default ChatbotWidget;
