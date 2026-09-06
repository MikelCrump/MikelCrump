export function NorthstarMark({
  className = "h-8 w-8",
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? "pulse-star" : ""}`}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <path
        d="M32 8 L35.2 26.8 L52 32 L35.2 37.2 L32 56 L28.8 37.2 L12 32 L28.8 26.8 Z"
        fill="var(--star)"
        stroke="var(--ink)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="3.2" fill="var(--ink)" />
    </svg>
  );
}
