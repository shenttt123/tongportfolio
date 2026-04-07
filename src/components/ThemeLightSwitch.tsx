import { useSiteTheme } from "../context/SiteThemeContext";
import { cn } from "../lib/utils";

/**
 * Floating wall-style light switch: up = lights on (warm light theme), down = dark theme.
 */
export function ThemeLightSwitch() {
  const { isLight, toggle } = useSiteTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      title={isLight ? "Switch to dark theme" : "Switch to warm light theme"}
      aria-label={isLight ? "Turn off lights — use dark theme" : "Turn on lights — use warm light theme"}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex flex-col items-center gap-2",
        "select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 rounded-xl",
        isLight ? "focus-visible:ring-offset-[#faf6f0]" : "focus-visible:ring-offset-[#0a0a0a]"
      )}
    >
      <span
        className={cn(
          "text-[9px] font-mono uppercase tracking-[0.2em] transition-colors",
          isLight ? "text-stone-600" : "text-stone-500"
        )}
      >
        {isLight ? "On" : "Off"}
      </span>

      <div
        className={cn(
          "relative h-[4.25rem] w-[2.75rem] rounded-lg p-1 shadow-inner transition-all duration-300",
          "border",
          isLight
            ? "border-amber-200/90 bg-gradient-to-b from-[#fffef8] to-[#f5edd8] shadow-[0_8px_28px_rgba(251,191,36,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]"
            : "border-stone-700 bg-gradient-to-b from-stone-900 to-stone-950 shadow-[0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]"
        )}
      >
        {/* Screw heads */}
        <div
          className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-stone-500/40 shadow-inner"
          aria-hidden
        />
        <div
          className="absolute left-1/2 bottom-1 h-1 w-1 -translate-x-1/2 rounded-full bg-stone-500/40 shadow-inner"
          aria-hidden
        />

        <div
          className={cn(
            "relative mx-auto mt-1 h-[3.25rem] w-[1.65rem] rounded-md p-0.5",
            isLight ? "bg-[#e8dcc4]/90" : "bg-stone-950/90"
          )}
        >
          {/* Track */}
          <div
            className={cn(
              "absolute inset-x-1 top-1 bottom-1 rounded-sm",
              isLight ? "bg-[#d4c4a8]/60" : "bg-black/50"
            )}
            aria-hidden
          />

          {/* Paddle — top = lights on */}
          <div
            className={cn(
              "absolute left-1/2 z-[1] h-[1.35rem] w-[1.1rem] -translate-x-1/2 rounded-[3px] transition-all duration-300 ease-out motion-reduce:transition-none",
              isLight
                ? "top-0.5 bg-gradient-to-b from-[#fffef5] to-[#f0e4c8] shadow-[0_3px_6px_rgba(180,140,60,0.35),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-amber-200/70"
                : "bottom-0.5 bg-gradient-to-b from-stone-700 to-stone-800 shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-stone-900/80"
            )}
          >
            <div
              className={cn(
                "mx-auto mt-1 h-px w-2/3 rounded-full opacity-60",
                isLight ? "bg-amber-900/25" : "bg-white/15"
              )}
            />
          </div>
        </div>

        {/* Glow when "on" */}
        {isLight ? (
          <div
            className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-amber-300/25 blur-xl motion-reduce:blur-none"
            aria-hidden
          />
        ) : null}
      </div>
    </button>
  );
}
