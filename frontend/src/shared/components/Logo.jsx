import { ScanEye } from "lucide-react";

export default function Logo({ tone = "dark", subtitle }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-white shadow-sm">
        <ScanEye className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight ${tone === "dark" ? "text-ink" : "text-white"}`}>
          CivicConnect
        </span>
        {subtitle && (
          <span className={`block text-[11px] font-medium ${tone === "dark" ? "text-mute" : "text-white/50"}`}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
