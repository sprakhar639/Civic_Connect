import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// Keeps list filters in the URL so filtered views can be linked and survive
// reloads. Values equal to their default are left out of the URL.
export default function useFilterParams(defaults) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, params.get(key) ?? value])),
    [params, defaults],
  );

  const setFilters = useCallback(
    (next) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(next)) {
            if (value === defaults[key] || value === "") updated.delete(key);
            else updated.set(key, value);
          }
          return updated;
        },
        { replace: true },
      );
    },
    [setParams, defaults],
  );

  return [filters, setFilters];
}
