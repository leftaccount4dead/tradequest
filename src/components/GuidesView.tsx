"use client";

import { useState } from "react";
import { GUIDES, GUIDE_CATEGORIES, GUIDE_ATTRIBUTION } from "@/lib/guides/content";
import type { Guide } from "@/lib/types";
import { useApp } from "./AppProvider";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { CheckCircle2, ChevronRight, GraduationCap } from "lucide-react";

const DIFFICULTY_STYLES = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  advanced: "text-red-400 bg-red-500/10 border-red-500/20",
};

function GuideCard({
  guide,
  read,
  onSelect,
}: {
  guide: Guide;
  read: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="glass-card glass-card-hover w-full rounded-2xl p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{guide.title}</h3>
            {read && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{guide.category}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              DIFFICULTY_STYLES[guide.difficulty],
            )}
          >
            {guide.difficulty}
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </div>
      </div>
    </button>
  );
}

function GuideAttribution({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]",
        compact ? "p-3 mt-4" : "p-4 mt-8",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
        Inspired by
      </p>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        <strong className="text-[var(--text-primary)]">{GUIDE_ATTRIBUTION.title}</strong>
        {" "}by {GUIDE_ATTRIBUTION.author} ({GUIDE_ATTRIBUTION.organization}, {GUIDE_ATTRIBUTION.year}).
        Lessons are adapted summaries for TradeQuest&apos;s simulator — not the full book.
      </p>
      <a
        href={GUIDE_ATTRIBUTION.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-violet-500 hover:text-violet-400 mt-2 inline-block"
      >
        Read the original PDF →
      </a>
      {!compact && (
        <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
          {GUIDE_ATTRIBUTION.disclaimer}
        </p>
      )}
    </div>
  );
}

function GuideDetail({ guide, onBack }: { guide: Guide; onBack: () => void }) {
  return (
    <GlassCard padding="lg">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-[var(--text-secondary)] hover:text-white transition"
      >
        ← Back to guides
      </button>

      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase",
            DIFFICULTY_STYLES[guide.difficulty],
          )}
        >
          {guide.difficulty}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{guide.category}</span>
        {guide.sourceChapter && (
          <span className="text-[10px] text-[var(--text-muted)]">· {guide.sourceChapter}</span>
        )}
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-6">{guide.title}</h2>

      <div className="space-y-4">
        {guide.content.split("\n\n").map((paragraph, i) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return (
              <h3 key={i} className="text-lg font-semibold text-white mt-6 mb-2">
                {paragraph.replace(/\*\*/g, "")}
              </h3>
            );
          }
          const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className="text-[var(--text-secondary)] leading-relaxed">
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**")
                  ? <strong key={j} className="text-white font-medium">{part.slice(2, -2)}</strong>
                  : part.startsWith("- ")
                    ? null
                    : part
              )}
            </p>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3">Key Takeaways</h3>
        <ul className="space-y-2.5">
          {guide.keyTakeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              {takeaway}
            </li>
          ))}
        </ul>
      </div>

      <GuideAttribution />
    </GlassCard>
  );
}

export function GuidesView() {
  const { readGuideIds, markGuideRead } = useApp();
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const openGuide = (guide: Guide) => {
    markGuideRead(guide.id);
    setSelectedGuide(guide);
  };

  if (selectedGuide) {
    return <GuideDetail guide={selectedGuide} onBack={() => setSelectedGuide(null)} />;
  }

  const filtered =
    filter === "all" ? GUIDES : GUIDES.filter((g) => g.category === filter);
  const readCount = readGuideIds.length;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20">
            <GraduationCap className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trading Guides</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-lg">
              Lessons inspired by Markus Heitkoetter&apos;s day trading guide, adapted for your $100 simulator. {readCount}/{GUIDES.length} completed.
            </p>
          </div>
        </div>

        <div className="h-2 w-full sm:w-48 rounded-full bg-black/40 border border-[var(--border-subtle)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${(readCount / GUIDES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-medium transition",
            filter === "all"
              ? "nav-tab-active"
              : "bg-white/5 text-[var(--text-muted)] hover:text-white border border-transparent",
          )}
        >
          All
        </button>
        {GUIDE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-medium transition",
              filter === cat
                ? "nav-tab-active"
                : "bg-white/5 text-[var(--text-muted)] hover:text-white border border-transparent",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            read={readGuideIds.includes(guide.id)}
            onSelect={() => openGuide(guide)}
          />
        ))}
      </div>

      <GuideAttribution compact />
    </div>
  );
}
