import { Construction, Trash2 } from "lucide-react";

export default function IssueTypeIcon({ type, className = "size-4" }) {
  const Icon = type === "POTHOLE" ? Construction : Trash2;
  return <Icon className={className} aria-hidden="true" />;
}
