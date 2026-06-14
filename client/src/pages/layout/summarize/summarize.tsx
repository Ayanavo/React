import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
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
import { AlertCircle, Bot, FileText, Loader2, Paperclip, Send, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./summarize.scss";

const MODEL_STORAGE_KEY = "summarize:selected-model";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
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

function SummarizeComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(readStoredModel);
  const [lastError, setLastError] = useState<SummarizeErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedModelOption = GEMINI_MODEL_OPTIONS.find((option) => option.id === selectedModel);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, lastError]);

  useEffect(() => {
    sessionStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

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

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
          meta: assistantMeta,
        },
      ]);
    } catch (error) {
      const errorInfo = parseSummarizeError(error, selectedModel);
      setLastError(errorInfo);
      setMessages((prev) => prev.slice(0, -1));

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
                {message.content.split("\n").map((line, index) => (
                  <p key={index}>{line || "\u00A0"}</p>
                ))}
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
    </div>
  );
}

export default SummarizeComponent;
