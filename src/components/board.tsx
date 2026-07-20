"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { Owner, Pending } from "@/generated/prisma/client";
import { moveTopic } from "@/app/actions";
import { FiltersBar, type SortOption } from "@/components/filters-bar";
import { PendingRow } from "@/components/pending-row";
import { TopicSection } from "@/components/topic-section";
import { PendingFormDialog } from "@/components/pending-form-dialog";
import { Button } from "@/components/ui/button";
import { isOverdue } from "@/lib/dates";

const IMPORTANCE_RANK: Record<Pending["importance"], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function Board({
  pendings,
  currentUser,
  topicOrder,
}: {
  pendings: Pending[];
  currentUser: Owner;
  topicOrder: string[];
}) {
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | Owner>("ALL");
  const [showCompleted, setShowCompleted] = useState(false);
  const [sort, setSort] = useState<SortOption>("dueDate");

  // topicOrder should already contain every topic in use (actions.ts
  // creates a Topic row the first time a name is used), but fall back to
  // appending anything unexpectedly missing so nothing silently disappears.
  const allTopics = useMemo(() => {
    const missing = Array.from(new Set(pendings.map((p) => p.topic))).filter(
      (t) => !topicOrder.includes(t),
    );
    return [...topicOrder, ...missing.sort()];
  }, [pendings, topicOrder]);

  const visible = useMemo(() => {
    return pendings
      .filter((p) => ownerFilter === "ALL" || p.owner === ownerFilter)
      .filter((p) => showCompleted || !p.completed);
  }, [pendings, ownerFilter, showCompleted]);

  const groups = useMemo(() => {
    const byTopic = new Map<string, Pending[]>();
    for (const p of visible) {
      const list = byTopic.get(p.topic) ?? [];
      list.push(p);
      byTopic.set(p.topic, list);
    }

    const sorter = (a: Pending, b: Pending) =>
      sort === "importance"
        ? IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance]
        : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

    return allTopics
      .map((topic, index) => {
        const items = byTopic.get(topic);
        if (!items) return null;
        return {
          topic,
          items: [...items].sort(sorter),
          overdueCount: items.filter((p) =>
            isOverdue(new Date(p.dueDate), p.completed),
          ).length,
          isFirst: index === 0,
          isLast: index === allTopics.length - 1,
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [visible, sort, allTopics]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-wide uppercase">
          {visible.length} pending{visible.length === 1 ? "" : "s"}
        </h2>
        <PendingFormDialog
          mode="create"
          currentUser={currentUser}
          topics={allTopics}
          trigger={
            <Button type="button">
              <Plus /> Add pending
            </Button>
          }
        />
      </div>

      <FiltersBar
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        sort={sort}
        onSortChange={setSort}
      />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <p className="font-medium">Nothing here</p>
          <p className="text-sm">Add a pending or adjust your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <TopicSection
              key={group.topic}
              topic={group.topic}
              count={group.items.length}
              overdueCount={group.overdueCount}
              canMoveUp={!group.isFirst}
              canMoveDown={!group.isLast}
              onMoveUp={() => moveTopic(group.topic, "up")}
              onMoveDown={() => moveTopic(group.topic, "down")}
            >
              {group.items.map((pending) => (
                <PendingRow key={pending.id} pending={pending} topics={allTopics} />
              ))}
            </TopicSection>
          ))}
        </div>
      )}
    </div>
  );
}
