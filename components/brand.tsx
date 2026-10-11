import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("brand", className)} role="img" aria-label="SarjHR">
      <svg className="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect className="brand-tile" x="1" y="1" width="46" height="46" rx="13" />
        <path
          className="brand-monogram"
          d="M29 10H21L11 22H27L17 35H25L36 20H20L29 10Z"
        />
        <path
          className="brand-spark"
          d="M35 7L36.6 11.4L41 13L36.6 14.6L35 19L33.4 14.6L29 13L33.4 11.4L35 7Z"
        />
      </svg>
      {!compact && (
        <span className="brand-name">
          sarj<span>HR</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </span>
  );
}
