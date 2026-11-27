import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

// Keeps what the user types locally and reports it after a short pause, so
// parents can store the query in the URL without dropping keystrokes.
export default function SearchInput({ value, onChange, placeholder = "Search…", className = "", label, debounceMs = 250 }) {
  const [draft, setDraft] = useState(value);
  const [lastSeen, setLastSeen] = useState(value);
  const [lastSent, setLastSent] = useState(value);

  // Adopt outside changes (e.g. "Clear filters"), but not echoes of our own updates.
  if (value !== lastSeen) {
    setLastSeen(value);
    if (value !== lastSent) setDraft(value);
  }

  useEffect(() => {
    if (draft === lastSent) return;
    const timer = setTimeout(() => {
      setLastSent(draft);
      onChange(draft);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, lastSent, onChange, debounceMs]);

  function clear() {
    setDraft("");
    setLastSent("");
    onChange("");
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="h-10 w-full rounded-lg border border-line bg-white pr-9 pl-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
