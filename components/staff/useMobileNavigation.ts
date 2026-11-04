"use client";

import { useEffect, useRef, useState } from "react";

/** Keep the off-canvas navigation out of the tab order and contain focus when open. */
export function useMobileNavigation() {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const main = mainRef.current;
    const toggle = toggleRef.current;
    const media = window.matchMedia("(max-width: 760px)");
    const previousOverflow = document.body.style.overflow;
    let focusWasContained = false;
    function sync() {
      if (!sidebar || !main) return;
      sidebar.inert = media.matches && !open;
      main.inert = media.matches && open;
      document.body.style.overflow = media.matches && open ? "hidden" : previousOverflow;
      if (media.matches && open) {
        sidebar.querySelector<HTMLButtonElement>(".staff-nav-close")?.focus();
        focusWasContained = true;
      }
    }
    function onKey(event: KeyboardEvent) {
      if (!media.matches || !open || !sidebar) return;
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const items = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]')).filter(el => el.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("keydown", onKey);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (sidebar) sidebar.inert = false;
      if (main) main.inert = false;
      if (focusWasContained && sidebar?.contains(document.activeElement)) toggle?.focus();
    };
  }, [open]);

  return { open, setOpen, sidebarRef, mainRef, toggleRef };
}
