import { useEffect, useRef } from "react";

/** Matches Navbar navItems ids (single-page sections). */
export const HOME_SECTION_IDS = [
  "home",
  "projects",
  "notes",
  "tools",
  "reading",
  "demos",
  "about",
  "contact",
] as const;

const NAV_OFFSET = 56;
const EPS = 10;
const WHEEL_COOLDOWN_MS = 450;
const TOUCH_SWIPE_MIN = 56;

function absTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

function absBottom(el: HTMLElement): number {
  return absTop(el) + el.offsetHeight;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getSections(): HTMLElement[] {
  return HOME_SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el != null);
}

function getSectionIndexForCenter(sections: HTMLElement[]): number {
  if (sections.length === 0) return 0;
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  const center = scrollY + vh / 2;

  const firstTop = absTop(sections[0]);
  const lastBottom = absBottom(sections[sections.length - 1]);

  if (center < firstTop) return 0;
  if (center > lastBottom) return sections.length - 1;

  for (let i = 0; i < sections.length; i++) {
    const t = absTop(sections[i]);
    const b = absBottom(sections[i]);
    if (center >= t && center <= b) return i;
  }

  for (let i = 0; i < sections.length - 1; i++) {
    const b = absBottom(sections[i]);
    const tNext = absTop(sections[i + 1]);
    if (center > b && center < tNext) return i + 1;
  }

  return sections.length - 1;
}

function isAtTopOfSection(el: HTMLElement, scrollY: number): boolean {
  const t = absTop(el);
  return scrollY <= t - NAV_OFFSET + EPS;
}

function isAtBottomOfSection(el: HTMLElement, scrollY: number, vh: number): boolean {
  const b = absBottom(el);
  return scrollY + vh >= b - EPS;
}

function scrollToY(target: number) {
  const y = Math.max(0, target);
  window.scrollTo({
    top: y,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * On the home page only: wheel / touch swipe snap between sections when the viewport
 * is at the top or bottom of the current section. Long sections scroll normally until
 * a boundary is reached.
 */
export function useHomeFullPageScroll(enabled: boolean) {
  const cooldownUntil = useRef(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const tryNavigate = (directionDown: boolean): boolean => {
      if (Date.now() < cooldownUntil.current) return false;

      const sections = getSections();
      if (sections.length === 0) return false;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const idx = getSectionIndexForCenter(sections);
      const current = sections[idx];

      if (directionDown) {
        if (!isAtBottomOfSection(current, scrollY, vh)) return false;
        if (idx >= sections.length - 1) return false;
        const next = sections[idx + 1];
        scrollToY(absTop(next) - NAV_OFFSET);
        cooldownUntil.current = Date.now() + WHEEL_COOLDOWN_MS;
        return true;
      }

      if (!isAtTopOfSection(current, scrollY)) return false;
      if (idx <= 0) return false;
      const prev = sections[idx - 1];
      scrollToY(absTop(prev) - NAV_OFFSET);
      cooldownUntil.current = Date.now() + WHEEL_COOLDOWN_MS;
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const delta = e.deltaY;
      if (Math.abs(delta) < 1) return;

      if (delta > 0) {
        if (tryNavigate(true)) e.preventDefault();
      } else {
        if (tryNavigate(false)) e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const endY = e.changedTouches[0]?.clientY;
      if (endY == null) {
        touchStartY.current = null;
        return;
      }
      const dy = touchStartY.current - endY;
      touchStartY.current = null;
      if (Math.abs(dy) < TOUCH_SWIPE_MIN) return;

      if (dy > 0) {
        tryNavigate(true);
      } else {
        tryNavigate(false);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled]);
}
