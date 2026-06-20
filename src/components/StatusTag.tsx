import type { Booking } from "@/lib/types";
import { Tag } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/format";

export function StatusTag({ status }: { status: Booking["status"] }) {
  const tone =
    status === "CONFIRMED"
      ? "oxblood"
      : status === "COMPLETED"
      ? "default"
      : "muted";
  return <Tag tone={tone as "oxblood" | "default" | "muted"}>{STATUS_LABELS[status]}</Tag>;
}
