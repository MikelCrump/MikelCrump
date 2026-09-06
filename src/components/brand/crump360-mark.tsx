export function Crump360Mark({
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
      className={`${className} ${animate ? "pulse-orbit" : ""}`}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" />
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="10"
        stroke="var(--sea)"
        strokeWidth="1.6"
        transform="rotate(-28 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="10"
        stroke="var(--star)"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        transform="rotate(38 32 32)"
      />
      <circle cx="32" cy="32" r="5.5" fill="var(--ink)" />
      <circle cx="48" cy="24" r="3.2" fill="var(--star)" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}
