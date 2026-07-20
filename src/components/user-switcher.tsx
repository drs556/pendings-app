"use client";

import { useTransition } from "react";
import { setCurrentUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Owner } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const LABELS: Record<Owner, string> = {
  JAVIER: "Javier",
  ANDY: "Andy",
};

export function UserSwitcher({ current }: { current: Owner | null }) {
  const [isPending, startTransition] = useTransition();

  function pick(user: Owner) {
    startTransition(() => {
      setCurrentUser(user);
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {(Object.keys(LABELS) as Owner[]).map((user) => (
        <Button
          key={user}
          type="button"
          size="sm"
          variant={current === user ? "default" : "ghost"}
          disabled={isPending}
          onClick={() => pick(user)}
          className={cn(current === user && "shadow-sm")}
        >
          {LABELS[user]}
        </Button>
      ))}
    </div>
  );
}

export function WhoIsThisScreen() {
  const [isPending, startTransition] = useTransition();

  function pick(user: Owner) {
    startTransition(() => {
      setCurrentUser(user);
    });
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4">
      <div className="hazard-stripe fixed inset-x-0 top-0 h-2 w-full" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-widest text-primary uppercase">
          Pendings
        </h1>
        <p className="tracking-wide text-muted-foreground">
          「 Who&apos;s using this? 」
        </p>
      </div>
      <div className="flex gap-3">
        {(Object.keys(LABELS) as Owner[]).map((user) => (
          <Button
            key={user}
            type="button"
            size="lg"
            disabled={isPending}
            onClick={() => pick(user)}
            className="min-w-28"
          >
            {LABELS[user]}
          </Button>
        ))}
      </div>
    </div>
  );
}
