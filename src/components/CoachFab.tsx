"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "./AppProvider";
import { COACH_SUGGESTIONS } from "@/lib/coach/coach";
import { cn } from "@/lib/utils";
import { Bot, MessageCircle, Send, X } from "lucide-react";

function formatCoachText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>
            : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export function CoachFab() {
  const { coachMessages, sendCoachMessage, coachThinking } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [coachMessages, open, coachThinking]);

  const handleSend = async () => {
    if (!input.trim() || coachThinking) return;
    const text = input.trim();
    setInput("");
    await sendCoachMessage(text);
  };

  const handleSuggestion = async (s: string) => {
    if (coachThinking) return;
    await sendCoachMessage(s);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col items-end gap-3 safe-bottom safe-right">
      {open && (
        <div
          className="w-[calc(100vw-1.5rem)] max-w-[380px] h-[min(72vh,520px)] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-[var(--text-primary)]">AI Coach</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Live AI · sees your chart & portfolio</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="icon-btn"
              aria-label="Close coach"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 bg-[var(--bg-surface)]">
            {coachMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed border",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
                  )}
                >
                  {msg.role === "coach" ? formatCoachText(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {coachThinking && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
                    </span>
                    Thinking…
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-[var(--bg-surface)]">
            {COACH_SUGGESTIONS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                disabled={coachThinking}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[10px] text-[var(--text-muted)] hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border-subtle)] p-3 flex gap-2 bg-[var(--bg-elevated)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about this chart…"
              disabled={coachThinking}
              className="input-field flex-1 rounded-xl px-3 py-2.5 text-xs disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || coachThinking}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 transition hover:bg-violet-700"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 touch-manipulation",
          open
            ? "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/30",
        )}
        title="AI Trading Coach"
        aria-label="Open AI coach"
      >
        {open ? (
          <X className="h-6 w-6 text-[var(--text-primary)]" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
