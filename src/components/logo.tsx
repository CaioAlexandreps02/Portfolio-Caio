export function CaioPortoLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 188 48"
      role="img"
      aria-label="Caio Porto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.5 11.5H22C13.99 11.5 7.5 17.99 7.5 26S13.99 40.5 22 40.5H26.5"
        stroke="var(--primary)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M27.5 11.5H40.25C45.36 11.5 49.5 15.64 49.5 20.75S45.36 30 40.25 30H27.5V40.5"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="65"
        y="32"
        fill="currentColor"
        fontFamily="var(--font-geist-sans), Arial, Helvetica, sans-serif"
        fontSize="21"
        fontWeight="850"
        letterSpacing="-0.9"
      >
        Caio Porto
      </text>
    </svg>
  );
}
