import { AlertTriangle, RefreshCw, SearchX, WifiOff } from "lucide-react";

import Button from "./Button";

function describe(error) {
  if (error?.status === 0) {
    return { icon: WifiOff, title: "Can't reach the server", message: error.message };
  }
  if (error?.status === 404) {
    return { icon: SearchX, title: "Not found", message: error.message };
  }
  return { icon: AlertTriangle, title: "Something went wrong", message: error?.message ?? "Please try again." };
}

export default function ErrorState({ error, onRetry, className = "" }) {
  const { icon: Icon, title, message } = describe(error);
  return (
    <div role="alert" className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <div className="grid size-12 place-items-center rounded-full bg-red-50 text-red-500">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-mute">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
