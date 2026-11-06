interface ScreenFlowLogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
}

export default function ScreenFlowLogo({
  variant = "dark",
  compact = false,
}: ScreenFlowLogoProps) {
  const titleColor = variant === "light" ? "text-white" : "text-ink";
  const accentColor = variant === "light" ? "text-brand" : "text-brand-dark";
  const subtitleColor = variant === "light" ? "text-white/50" : "text-ink-muted";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand shadow-sm">
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="h-6 w-6 text-ink"
          fill="none"
        >
          <path
            d="M7 11h13.5l-3.2-3.2"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 21H11.5l3.2 3.2"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="21" r="2.2" fill="currentColor" />
          <circle cx="25" cy="11" r="2.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <strong className={`block text-lg font-black tracking-tight ${titleColor}`}>
            Screen<span className={accentColor}>Flow</span>
          </strong>
          <span
            className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${subtitleColor}`}
          >
            CEIBA · BUK
          </span>
        </span>
      )}
    </span>
  );
}
