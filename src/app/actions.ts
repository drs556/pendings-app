"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pendingSchema, OWNERS, type PendingFormValues } from "@/lib/validation";
import { setCurrentUserCookie } from "@/lib/current-user";
import type { Owner } from "@/generated/prisma/client";

export type ActionResult = { error: string } | { error?: undefined };

// Topics are free-typed strings on Pending, but the board needs a stable,
// user-orderable list of them. Lazily create a Topic row the first time a
// name is used, appended after whatever currently has the highest order.
async function ensureTopic(name: string) {
  const existing = await prisma.topic.findUnique({ where: { name } });
  if (existing) return;

  const max = await prisma.topic.aggregate({ _max: { order: true } });
  try {
    await prisma.topic.create({
      data: { name, order: (max._max.order ?? -1) + 1 },
    });
  } catch {
    // Another request created the same topic concurrently — fine, ignore.
  }
}

export async function createPending(
  values: PendingFormValues,
): Promise<ActionResult> {
  const parsed = pendingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await ensureTopic(parsed.data.topic);
  await prisma.pending.create({
    data: {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate),
    },
  });

  revalidatePath("/");
  return {};
}

export async function updatePending(
  id: string,
  values: PendingFormValues,
): Promise<ActionResult> {
  const parsed = pendingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await ensureTopic(parsed.data.topic);
  await prisma.pending.update({
    where: { id },
    data: {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate),
    },
  });

  revalidatePath("/");
  return {};
}

export async function moveTopic(name: string, direction: "up" | "down") {
  const topics = await prisma.topic.findMany({ orderBy: { order: "asc" } });
  const index = topics.findIndex((t) => t.name === name);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= topics.length) return;

  const current = topics[index];
  const neighbor = topics[swapIndex];
  await prisma.$transaction([
    prisma.topic.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.topic.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  revalidatePath("/");
}

export async function toggleComplete(id: string, completed: boolean) {
  await prisma.pending.update({
    where: { id },
    data: { completed },
  });
  revalidatePath("/");
}

export async function deletePending(id: string) {
  await prisma.pending.delete({ where: { id } });
  revalidatePath("/");
}

export async function setCurrentUser(user: string) {
  if (!(OWNERS as readonly string[]).includes(user)) {
    throw new Error("Unknown user");
  }
  await setCurrentUserCookie(user as Owner);
  revalidatePath("/");
}
