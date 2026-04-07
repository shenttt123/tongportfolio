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

/** Fixed nav height (must match `pt-14` / Navbar). */
const NAV_OFFSET = 56;

/** Pixel slack for boundary comparisons. */
const EPS = 10;

/** After snapping to a section, scroll this many px further so less of the section top is visible (视线偏下). */
const SECTION_SCROLL_PEEL_PX = 52;

/**
 * Which fraction of the viewport height defines the “focus” line for picking the current section.
 * 0.5 = middle; 0.58–0.65 = lower on screen → feels like looking slightly downward / 上沿少露一点.
 */
const VIEWPORT_CENTER_RATIO = 0.62;

/**
 * Only treat as “bottom of section” after the viewport has scrolled this many px *past* the
 * section’s bottom edge → user must scroll more before jumping to the next section.
 */
const BOTTOM_RELEASE_PX = 56;

/** Same idea upward: must scroll further up past the aligned top before previous section. */
const TOP_RELEASE_PX = 36;

const WHEEL_COOLDOWN_MS = 480;

/** Minimum vertical swipe (px) to trigger section change on touch. */
const TOUCH_SWIPE_MIN = 72;

/** On coarse pointers (phones), require a slightly longer swipe. */
const TOUCH_SWIPE_MIN_COARSE = 96;

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

function getSectionIndexForCenter(sections: HTMLElement[], centerRatio: number): number {
  if (sections.length === 0) return 0;
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  const center = scrollY + vh * centerRatio;

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

function alignedSectionTopScroll(el: HTMLElement): number {
  return absTop(el) - NAV_OFFSET - SECTION_SCROLL_PEEL_PX;
}

function isAtTopOfSection(el: HTMLElement, scrollY: number): boolean {
  const align = alignedSectionTopScroll(el);
  return scrollY <= align + TOP_RELEASE_PX + EPS;
}

function isAtBottomOfSection(el: HTMLElement, scrollY: number, vh: number): boolean {
  const b = absBottom(el);
  return scrollY + vh >= b + BOTTOM_RELEASE_PX - EPS;
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
 *
 * Tune constants at the top of this file: `SECTION_SCROLL_PEEL_PX`, `VIEWPORT_CENTER_RATIO`,
 * `BOTTOM_RELEASE_PX`, `TOUCH_SWIPE_MIN`, etc.
 */
export function useHomeFullPageScroll(enabled: boolean) {
  const cooldownUntil = useRef(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const touchMin =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
        ? TOUCH_SWIPE_MIN_COARSE
        : TOUCH_SWIPE_MIN;

    const tryNavigate = (directionDown: boolean): boolean => {
      if (Date.now() < cooldownUntil.current) return false;

      const sections = getSections();
      if (sections.length === 0) return false;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const idx = getSectionIndexForCenter(sections, VIEWPORT_CENTER_RATIO);
      const current = sections[idx];

      if (directionDown) {
        if (!isAtBottomOfSection(current, scrollY, vh)) return false;
        if (idx >= sections.length - 1) return false;
        const next = sections[idx + 1];
        scrollToY(alignedSectionTopScroll(next));
        cooldownUntil.current = Date.now() + WHEEL_COOLDOWN_MS;
        return true;
      }

      if (!isAtTopOfSection(current, scrollY)) return false;
      if (idx <= 0) return false;
      const prev = sections[idx - 1];
      scrollToY(alignedSectionTopScroll(prev));
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
      if (Math.abs(dy) < touchMin) return;

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
