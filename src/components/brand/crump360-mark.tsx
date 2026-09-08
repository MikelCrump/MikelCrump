export function Crump360Mark({
  className = "h-8 w-8",
  animate = false,
  tone = "light",
}: {
  className?: string;
  animate?: boolean;
  /** light = for dark backgrounds; dark = for light backgrounds */
  tone?: "light" | "dark";
}) {
  const stroke = tone === "light" ? "#E8E9ED" : "#191A21";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? "pulse-orbit" : ""}`}
      aria-hidden
    >
      <path
        d="M50.2 18.4A22 22 0 1 0 50.2 45.6"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="butt"
      />
      <circle
        cx="52"
        cy="32"
        r="5.2"
        fill="#E68A2C"
        className={animate ? "pulse-orbit" : undefined}
      />
    </svg>
  );
}

export function Crump360Wordmark({
  className = "",
  markClassName = "h-8 w-8",
  textClassName = "text-xl sm:text-2xl",
  animate = false,
  tone = "dark",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  animate?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Crump360Mark
        className={markClassName}
        animate={animate}
        tone={tone === "light" ? "light" : "dark"}
      />
      <span
        className={`font-display font-bold tracking-tight ${textClassName} ${
          tone === "light" ? "text-cloud" : "text-navy"
        }`}
      >
        CRUMP
        <span className="text-blue">360</span>
      </span>
    </span>
  );
}
