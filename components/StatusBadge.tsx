import { INVITEE_STATUS, STATUS_COLORS, type InviteeStatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status as InviteeStatusKey;
  const label = INVITEE_STATUS[key] ?? status;
  const colorClass = STATUS_COLORS[key] ?? "bg-gray-100 text-gray-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
