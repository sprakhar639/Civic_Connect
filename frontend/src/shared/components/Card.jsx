export default function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-line px-5 py-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-mute">{description}</p>}
      </div>
      {action}
    </div>
  );
}
