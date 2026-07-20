import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { WhoIsThisScreen, UserSwitcher } from "@/components/user-switcher";
import { Board } from "@/components/board";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <WhoIsThisScreen />;
  }

  const [pendings, topicRows] = await Promise.all([
    prisma.pending.findMany({ orderBy: { dueDate: "asc" } }),
    prisma.topic.findMany({ orderBy: { order: "asc" } }),
  ]);
  const topicOrder = topicRows.map((t) => t.name);

  return (
    <div className="flex flex-1 flex-col">
      <div className="hazard-stripe h-1.5 w-full" />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-widest text-primary uppercase">
              Pendings
            </h1>
            <p className="text-sm tracking-wide text-muted-foreground">
              「 Shared board for Javier &amp; Andy 」
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserSwitcher current={currentUser} />
          </div>
        </header>

        <Board pendings={pendings} currentUser={currentUser} topicOrder={topicOrder} />
      </div>
    </div>
  );
}
