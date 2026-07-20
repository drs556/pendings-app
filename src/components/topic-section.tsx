"use client";

import { useState, useTransition } from "react";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TopicSection({
  topic,
  count,
  overdueCount,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  children,
}: {
  topic: string;
  count: number;
  overdueCount: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const [, startTransition] = useTransition();

  return (
    <section className="overflow-hidden rounded border border-border border-t-2 border-t-primary/70">
      <div className="flex items-center gap-1 bg-muted/60 px-1.5 py-1.5">
        <div className="flex shrink-0 flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={!canMoveUp}
            onClick={() => startTransition(onMoveUp)}
            aria-label={`Move ${topic} up`}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={!canMoveDown}
            onClick={() => startTransition(onMoveDown)}
            aria-label={`Move ${topic} down`}
          >
            <ChevronDown />
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-muted/60"
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
          />
          <span className="font-heading text-sm font-semibold tracking-wider uppercase">
            {topic}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{count}</span>
          {overdueCount > 0 && (
            <span className="ml-auto font-mono text-xs font-medium tracking-wide text-destructive uppercase">
              ⚠ {overdueCount} overdue
            </span>
          )}
        </button>
      </div>
      {expanded && <div className="divide-y divide-border">{children}</div>}
    </section>
  );
}
