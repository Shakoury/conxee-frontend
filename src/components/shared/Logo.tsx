export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg text-[var(--color-primary)] dark:-m-2 dark:bg-background dark:p-2">
      <svg
        viewBox="0 0 32 32"
        className="size-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M22 7a11 11 0 1 0 0 18"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="m18 12 9 9m0-9-9 9"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="text-[25px] font-bold tracking-tight">
          conxee<span className="sr-only"> home</span>
        </span>
      )}
    </span>
  );
}
