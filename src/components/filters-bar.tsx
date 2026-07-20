"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type SortOption = "dueDate" | "importance";

const SORT_ITEMS = [
  { value: "dueDate", label: "Sort by due date" },
  { value: "importance", label: "Sort by importance" },
];

export function FiltersBar({
  showEveryone,
  onShowEveryoneChange,
  showCompleted,
  onShowCompletedChange,
  sort,
  onSortChange,
}: {
  showEveryone: boolean;
  onShowEveryoneChange: (value: boolean) => void;
  showCompleted: boolean;
  onShowCompletedChange: (value: boolean) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={!showEveryone ? "default" : "outline"}
          className={cn(!showEveryone && "shadow-sm")}
          onClick={() => onShowEveryoneChange(false)}
        >
          Mine
        </Button>
        <Button
          type="button"
          size="sm"
          variant={showEveryone ? "default" : "outline"}
          className={cn(showEveryone && "shadow-sm")}
          onClick={() => onShowEveryoneChange(true)}
        >
          Everyone
        </Button>
      </div>

      <Select
        items={SORT_ITEMS}
        value={sort}
        onValueChange={(v) => onSortChange((v ?? "dueDate") as SortOption)}
      >
        <SelectTrigger size="sm" className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dueDate">Sort by due date</SelectItem>
          <SelectItem value="importance">Sort by importance</SelectItem>
        </SelectContent>
      </Select>

      <button
        type="button"
        aria-pressed={showCompleted}
        onClick={() => onShowCompletedChange(!showCompleted)}
        className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Checkbox checked={showCompleted} className="pointer-events-none" />
        Show completed
      </button>
    </div>
  );
}
