import { cn } from "@/lib/utils";

type AdminOrdersBadgeProps = {
  count: number;
  className?: string;
};

export function AdminOrdersBadge({ count, className }: AdminOrdersBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold leading-none text-white shadow-sm",
        "animate-[badge-pulse_2s_ease-in-out_infinite]",
        className,
      )}
      aria-label={`${count} nouvelle${count > 1 ? "s" : ""} commande${count > 1 ? "s" : ""}`}
    >
      {label}
    </span>
  );
}
