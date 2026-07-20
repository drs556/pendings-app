import { cookies } from "next/headers";
import { OWNERS } from "@/lib/validation";
import type { Owner } from "@/generated/prisma/client";

const COOKIE_NAME = "pendings-current-user";

export async function getCurrentUser(): Promise<Owner | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (value && (OWNERS as readonly string[]).includes(value)) {
    return value as Owner;
  }
  return null;
}

export async function setCurrentUserCookie(user: Owner) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, user, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
}
