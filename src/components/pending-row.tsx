"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePending, toggleComplete } from "@/app/actions";
import type { Pending } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PendingFormDialog } from "@/components/pending-form-dialog";
import { cn } from "@/lib/utils";
import { formatDueDate, isOverdue } from "@/lib/dates";

const IMPORTANCE_STYLES = {
  HIGH: {
    badge: "border-destructive/40 bg-destructive/15 text-destructive",
    label: "High",
  },
  MEDIUM: {
    badge: "border-primary/40 bg-primary/15 text-primary",
    label: "Medium",
  },
  LOW: {
    badge: "border-eva-green/40 bg-eva-green/15 text-eva-green",
    label: "Low",
  },
} as const;

const OWNER_LABELS = { JAVIER: "Javier", ANDY: "Andy" } as const;

export function PendingRow({
  pending,
  topics,
}: {
  pending: Pending;
  topics: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const dueDate = new Date(pending.dueDate);
  const overdue = isOverdue(dueDate, pending.completed);
  const importance = IMPORTANCE_STYLES[pending.importance];

  function handleToggle(checked: boolean) {
    startTransition(() => {
      toggleComplete(pending.id, checked);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deletePending(pending.id);
      toast.success("Pending removed");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-3 py-2 text-sm">
      <Checkbox
        checked={pending.completed}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        disabled={isPending}
        className="shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate font-medium leading-snug",
            pending.completed && "text-muted-foreground line-through",
          )}
        >
          {pending.title}
        </span>
        {pending.description && (
          <span className="truncate text-xs text-muted-foreground">
            {pending.description}
          </span>
        )}
      </div>

      <div className="ml-6 flex shrink-0 flex-wrap items-center gap-1.5 sm:ml-0">
        <Badge className={importance.badge} variant="outline">
          {importance.label}
        </Badge>

        <span
          className={cn(
            "font-mono text-xs font-medium whitespace-nowrap",
            overdue ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {formatDueDate(dueDate)}
        </span>

        <Badge variant="secondary" className="text-[0.65rem]">
          {OWNER_LABELS[pending.owner]}
        </Badge>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <PendingFormDialog
          mode="edit"
          pending={pending}
          topics={topics}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm">
              <Pencil />
              <span className="sr-only">Edit</span>
            </Button>
          }
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={handleDelete}
        >
          <Trash2 />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
