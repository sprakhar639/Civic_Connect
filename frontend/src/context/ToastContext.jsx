import { CheckCircle2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((toast) => toast.id !== id)), []);

  const show = useCallback(
    (message, tone = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[1100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-lg"
          >
            {toast.tone === "error" ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            )}
            <p className="flex-1 text-ink">{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="text-slate-400 hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
