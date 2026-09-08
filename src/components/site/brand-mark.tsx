type BrandMarkProps = {
  className?: string;
  animate?: boolean;
};

/** Orbit mark aligned with the Crump360 visual language. */
export function BrandMark({ className = "h-8 w-8", animate = false }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M50.2 18.4A22 22 0 1 0 50.2 45.6"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="butt"
        className={animate ? "mark-spin" : undefined}
      />
      <circle cx="52" cy="32" r="5.2" fill="#E68A2C" className={animate ? "pulse-orbit" : undefined} />
    </svg>
  );
}
