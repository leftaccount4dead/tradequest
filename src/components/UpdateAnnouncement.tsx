"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { LATEST_UPDATE, LATEST_UPDATE_ID } from "@/lib/constants";

const STORAGE_KEY = `tradequest-seen-update-${LATEST_UPDATE_ID}`;

export function UpdateAnnouncement() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-announcement-title"
    >
      <div className="glass-card relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 id="update-announcement-title" className="text-lg font-bold tracking-tight">
              {LATEST_UPDATE.title}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{LATEST_UPDATE.date}</p>
          </div>
        </div>

        <ul className="space-y-2.5 mb-6">
          {LATEST_UPDATE.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm text-[var(--text-secondary)] leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={dismiss}
          className="btn-primary w-full rounded-xl py-3 text-sm font-semibold"
        >
          Got it — let&apos;s trade
        </button>
      </div>
    </div>
  );
}
