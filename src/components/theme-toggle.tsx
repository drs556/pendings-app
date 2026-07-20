"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves the stored theme synchronously on the client (via
  // an inline script that runs before hydration), but the server has no
  // access to that value. Rendering the same placeholder on both the
  // server pass and the client's first pass — then swapping to the real
  // icon only after mount — is what keeps hydration markup matching.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required to bridge the SSR/CSR theme gap; see comment above
    setMounted(true);
  }, []);

  if (!mounted || !resolvedTheme) {
    return <Button type="button" variant="outline" size="icon-sm" disabled />;
  }

  const isDark = resolvedTheme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
    // Tailwind's color-mix()-based opacity utilities (bg-primary/15, etc.)
    // don't reliably repaint on a pure client-side class swap in every
    // browser, even though the underlying CSS variable does update. A
    // reload guarantees a correct paint; the toggle is rare enough that
    // this is a fine trade-off.
    window.location.reload();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
