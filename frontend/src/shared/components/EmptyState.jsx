import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-mute">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
