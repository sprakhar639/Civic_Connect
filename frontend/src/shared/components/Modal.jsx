import { X } from "lucide-react";
import { useEffect } from "react";

const SIZES = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export default function Modal({ open, title, description, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/50 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${SIZES[size]}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-mute">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">{children}</div>

        {footer && <div className="flex justify-end gap-2 border-t border-line bg-slate-50/60 px-6 py-3">{footer}</div>}
      </div>
    </div>
  );
}
