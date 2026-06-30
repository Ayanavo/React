import moment from "moment";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import SummaryContent from "@/components/summary/summary-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL_OPTIONS,
  parseSummarizeError,
  summarizeChat,
  summarizeFile,
  summarizeText,
  type GeminiModelId,
  type SummarizeErrorInfo,
} from "@/shared/services/summarize";
import { setJobSummaryContext } from "@/shared/utils/job-summary-context";
import { AlertCircle, Bot, FileText, History, Loader2, Mail, MessageSquare, Paperclip, Plus, Send, Sparkles, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./summarize.scss";

const MODEL_STORAGE_KEY = "summarize:selected-model";
const CHAT_HISTORY_STORAGE_KEY = "summarize:chat-sessions";
const ACTIVE_SESSION_KEY = "summarize:active-session-id";
const MAX_STORED_SESSIONS = 50;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  model: GeminiModelId;
  createdAt: string;
  updatedAt: string;
};

function Bubble({ role, children, meta }: { role: "user" | "assistant"; children: React.ReactNode; meta?: string }) {
  const isUser = role === "user";

  return (
    <div className={cn("summarize-bubble-row", isUser ? "summarize-bubble-row--user" : "summarize-bubble-row--assistant")}>
      {!isUser && (
        <span className="summarize-avatar" aria-hidden="true">
          <Bot size={16} />
        </span>
      )}
      <div className={cn("summarize-bubble", isUser ? "summarize-bubble--user" : "summarize-bubble--assistant")}>
        {meta && <p className="summarize-bubble__meta">{meta}</p>}
        <div className="summarize-bubble__content">{children}</div>
      </div>
    </div>
  );
}

function ErrorBanner({ error, onDismiss }: { error: SummarizeErrorInfo; onDismiss: () => void }) {
  return (
    <div className="summarize-error" role="alert">
      <div className="summarize-error__icon" aria-hidden="true">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="summarize-error__body">
        <p className="summarize-error__title">{error.title}</p>
        <p className="summarize-error__message">{error.message}</p>
        {error.hint && <p className="summarize-error__hint">{error.hint}</p>}
      </div>
      <Button type="button" variant="ghost" size="icon" className="summarize-error__dismiss" aria-label="Dismiss error" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

const ACCEPTED_FILES = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";

function readStoredModel(): GeminiModelId {
  const stored = sessionStorage.getItem(MODEL_STORAGE_KEY);
  if (stored && GEMINI_MODEL_OPTIONS.some((option) => option.id === stored)) {
    return stored as GeminiModelId;
  }
  return DEFAULT_GEMINI_MODEL;
}

function loadChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChatSessions(sessions: ChatSession[]) {
  localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_STORED_SESSIONS)));
}

function getSessionTitle(messages: Message[]): string {
  const firstUser = messages.find((msg) => msg.role === "user");
  if (!firstUser) return "New conversation";

  const source = firstUser.meta || firstUser.content;
  const normalized = source.replace(/\s+/g, " ").trim();
  if (!normalized) return "New conversation";
  return normalized.length > 56 ? `${normalized.slice(0, 53)}…` : normalized;
}

function formatSessionTime(iso: string): string {
  const date = moment(iso);
  if (date.isSame(moment(), "day")) return date.format("h:mm A");
  if (date.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  if (date.isAfter(moment().subtract(7, "days"))) return date.format("ddd");
  return date.format("MMM D");
}

function SummarizeComponent() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>(loadChatSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => sessionStorage.getItem(ACTIVE_SESSION_KEY)
  );
  const [messages, setMessages] = useState<Message[]>(() => {
    const storedSessions = loadChatSessions();
    const activeId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    return activeId ? (storedSessions.find((session) => session.id === activeId)?.messages ?? []) : [];
  });
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(() => {
    const storedSessions = loadChatSessions();
    const activeId = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    const activeSession = activeId ? storedSessions.find((session) => session.id === activeId) : undefined;
    return activeSession?.model ?? readStoredModel();
  });
  const [lastError, setLastError] = useState<SummarizeErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedModelOption = GEMINI_MODEL_OPTIONS.find((option) => option.id === selectedModel);
  const sortedSessions = [...sessions].sort(
    (a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf()
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, lastError]);

  useEffect(() => {
    sessionStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (activeSessionId) {
      sessionStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      return;
    }
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  }, [activeSessionId]);

  const upsertActiveSession = (nextMessages: Message[], model: GeminiModelId, sessionId?: string) => {
    const now = moment().toISOString();
    const id = sessionId ?? activeSessionId ?? crypto.randomUUID();
    const title = getSessionTitle(nextMessages);

    setSessions((prev) => {
      const existing = prev.find((session) => session.id === id);
      const nextSession: ChatSession = existing
        ? {
            ...existing,
            title,
            messages: nextMessages,
            model,
            updatedAt: now,
          }
        : {
            id,
            title,
            messages: nextMessages,
            model,
            createdAt: now,
            updatedAt: now,
          };

      const withoutCurrent = prev.filter((session) => session.id !== id);
      const nextSessions = [nextSession, ...withoutCurrent].slice(0, MAX_STORED_SESSIONS);
      saveChatSessions(nextSessions);
      return nextSessions;
    });

    if (!activeSessionId) {
      setActiveSessionId(id);
    }

    return id;
  };

  const handleNewChat = () => {
    if (isLoading) return;
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setSelectedFile(null);
    setLastError(null);
  };

  const handleSelectSession = (session: ChatSession) => {
    if (isLoading || session.id === activeSessionId) return;
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setSelectedModel(session.model);
    setInput("");
    setSelectedFile(null);
    setLastError(null);
  };

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isLoading) return;

    setSessions((prev) => {
      const nextSessions = prev.filter((session) => session.id !== sessionId);
      saveChatSessions(nextSessions);
      return nextSessions;
    });

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  const buildChatHistory = (nextMessages: Message[]) =>
    nextMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const trimmed = input.trim();
    if ((!trimmed && !selectedFile) || isLoading) return;

    const fileToUpload = selectedFile;
    const modelLabel = selectedModelOption?.label ?? selectedModel;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed || `Uploaded file: ${fileToUpload?.name}`,
      meta: fileToUpload ? fileToUpload.name : undefined,
    };

    const nextMessages = [...messages, userMessage];
    const sessionId = upsertActiveSession(nextMessages, selectedModel);
    setMessages(nextMessages);
    setInput("");
    setSelectedFile(null);
    setLastError(null);
    setIsLoading(true);

    try {
      let assistantContent = "";
      let assistantMeta = "";
      const isFirstMessage = messages.length === 0;
      const requestOptions = { model: selectedModel };

      if (fileToUpload) {
        const result = await summarizeFile(fileToUpload, requestOptions, trimmed || undefined);
        assistantContent = result.summary;
        assistantMeta = `Summary · ${result.fileName} · ${modelLabel}`;
      } else if (isFirstMessage) {
        const result = await summarizeText(trimmed, requestOptions);
        assistantContent = result.summary;
        assistantMeta = `Summary · ${modelLabel}`;
      } else {
        const result = await summarizeChat(buildChatHistory(nextMessages), requestOptions);
        assistantContent = result.response;
        assistantMeta = modelLabel;
      }

      const withAssistant: Message[] = [
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
          meta: assistantMeta,
        },
      ];
      setMessages(withAssistant);
      upsertActiveSession(withAssistant, selectedModel, sessionId);
    } catch (error) {
      const errorInfo = parseSummarizeError(error, selectedModel);
      setLastError(errorInfo);
      setMessages(messages);

      if (messages.length > 0) {
        upsertActiveSession(messages, selectedModel, sessionId);
      } else {
        setSessions((current) => {
          const nextSessions = current.filter((session) => session.id !== sessionId);
          saveChatSessions(nextSessions);
          return nextSessions;
        });
        setActiveSessionId(null);
      }

      showToast({
        title: errorInfo.title,
        description: errorInfo.hint || errorInfo.message,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLastError(null);
    }
    event.target.value = "";
  };

  const firstUserMessage = messages.find((msg) => msg.role === "user");
  const firstSummaryMessage = messages.find(
    (msg) => msg.role === "assistant" && msg.meta?.startsWith("Summary")
  );

  const handleCreateFromSummary = (target: "cv" | "cover-letter") => {
    if (!firstSummaryMessage) return;

    setJobSummaryContext({
      summary: firstSummaryMessage.content,
      sourceText: firstUserMessage?.content,
      fileName: firstUserMessage?.meta,
      model: selectedModel,
      createdAt: moment().toISOString(),
    });

    if (target === "cv") {
      sessionStorage.removeItem("cv-editor-session");
      sessionStorage.removeItem("cv-page-properties");
      navigate("/cv-builder/create", { state: { from: "summarize" } });
      return;
    }

    sessionStorage.removeItem("cover-letter-editor-session");
    sessionStorage.removeItem("cover-letter-page-properties");
    navigate("/cover-letter/create", { state: { from: "summarize" } });
  };

  const renderMessageContent = (message: Message) => {
    if (message.role === "assistant" && message.meta?.startsWith("Summary")) {
      return <SummaryContent content={message.content} />;
    }

    return message.content.split("\n").map((line, index) => (
      <p key={index}>{line || "\u00A0"}</p>
    ));
  };

  return (
    <div className="summarize-page">
      <div className="summarize-page__header">
        <BreadcrumbInbuild />
        <div className="summarize-page__title-row">
          <span className="summarize-page__icon" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <div className="summarize-page__title-copy">
            <h1 className="summarize-page__title">AI Summarize</h1>
            <p className="summarize-page__subtitle">
              Paste text or upload a PDF, Word, or Excel file to generate a summary. Ask follow-up questions in the chat.
            </p>
          </div>
        </div>
      </div>

      <div className="summarize-page__body">
      <section className="summarize-chat" aria-label="Summarize chat">
        <div className="summarize-chat__messages">
          {messages.length === 0 && !lastError ?
            <div className="summarize-empty">
              <FileText className="summarize-empty__icon" aria-hidden="true" />
              <p className="summarize-empty__title">Start summarizing</p>
              <p className="summarize-empty__text">
                Paste your content in the box below, or attach a document. Supported formats: PDF, DOC, DOCX, XLS, XLSX,
                CSV, TXT.
              </p>
              {selectedModelOption && (
                <p className="summarize-empty__model">Using {selectedModelOption.label}</p>
              )}
            </div>
          : messages.map((message) => (
              <Bubble key={message.id} role={message.role} meta={message.meta}>
                {renderMessageContent(message)}
                {message.id === firstSummaryMessage?.id && (
                  <div className="summarize-actions">
                    <span className="summarize-actions__label">Turn this job summary into:</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleCreateFromSummary("cv")}>
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Create CV
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleCreateFromSummary("cover-letter")}>
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Create Cover Letter
                    </Button>
                  </div>
                )}
              </Bubble>
            ))
          }

          {lastError && <ErrorBanner error={lastError} onDismiss={() => setLastError(null)} />}

          {isLoading && (
            <div className="summarize-bubble-row summarize-bubble-row--assistant">
              <span className="summarize-avatar" aria-hidden="true">
                <Bot size={16} />
              </span>
              <div className="summarize-bubble summarize-bubble--assistant summarize-bubble--loading">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Generating with {selectedModelOption?.label ?? selectedModel}…</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form className="summarize-composer" onSubmit={handleSend}>
          {selectedFile && (
            <div className="summarize-composer__attachment">
              <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label="Remove file"
                onClick={() => setSelectedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="summarize-composer__row">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILES}
              className="hidden"
              aria-hidden="true"
              onChange={onFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Attach file"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (lastError) setLastError(null);
              }}
              placeholder={selectedFile ? "Add a note (optional)…" : "Paste text to summarize or ask a follow-up…"}
              aria-label="Message"
              disabled={isLoading}
              className="summarize-composer__input"
            />
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as GeminiModelId)} disabled={isLoading}>
              <SelectTrigger id="summarize-model" className="summarize-composer__agent-trigger" aria-label="Select agent">
                <SelectValue placeholder="Agent">{selectedModelOption?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GEMINI_MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id} textValue={option.label}>
                    <span className="summarize-model-option">
                      <span className="summarize-model-option__label">{option.label}</span>
                      <span className="summarize-model-option__desc">{option.description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading || (!input.trim() && !selectedFile)} className="shrink-0">
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </form>
      </section>

      <aside className="summarize-history" aria-label="Chat history">
        <div className="summarize-history__header">
          <div className="summarize-history__title-row">
            <History className="h-4 w-4 shrink-0" aria-hidden="true" />
            <h2 className="summarize-history__title">Chat history</h2>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="summarize-history__new"
            disabled={isLoading}
            onClick={handleNewChat}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            New chat
          </Button>
        </div>

        <div className="summarize-history__list">
          {sortedSessions.length === 0 ?
            <div className="summarize-history__empty">
              <MessageSquare className="summarize-history__empty-icon" aria-hidden="true" />
              <p className="summarize-history__empty-title">No conversations yet</p>
              <p className="summarize-history__empty-text">
                Your summarize chats are saved here so you can return to them later.
              </p>
            </div>
          : sortedSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const modelLabel =
                GEMINI_MODEL_OPTIONS.find((option) => option.id === session.model)?.label ?? session.model;

              return (
                <button
                  key={session.id}
                  type="button"
                  className={cn("summarize-history__item", isActive && "summarize-history__item--active")}
                  disabled={isLoading}
                  onClick={() => handleSelectSession(session)}>
                  <div className="summarize-history__item-main">
                    <p className="summarize-history__item-title">{session.title}</p>
                    <p className="summarize-history__item-meta">
                      {formatSessionTime(session.updatedAt)} · {session.messages.length} messages · {modelLabel}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="summarize-history__delete"
                    aria-label={`Delete ${session.title}`}
                    disabled={isLoading}
                    onClick={(event) => handleDeleteSession(session.id, event)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </button>
              );
            })
          }
        </div>
      </aside>
      </div>
    </div>
  );
}

export default SummarizeComponent;
