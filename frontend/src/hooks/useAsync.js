import { useCallback, useEffect, useState } from "react";

// Runs `load` on mount and whenever `deps` (serialisable values) change.
// Returns the latest data, loading/error flags, a `reload` function and a
// `setData` for local updates. Data from the previous load stays available
// while a reload is in flight.
export default function useAsync(load, deps = []) {
  const [version, setVersion] = useState(0);
  const key = `${JSON.stringify(deps)}#${version}`;
  const [state, setState] = useState({ key: null, data: undefined, error: null });

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch((error) => !cancelled && setState((prev) => ({ key, data: prev.data, error })));
    return () => {
      cancelled = true;
    };
    // `load` is recreated every render; `key` captures its real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const setData = useCallback((update) => {
    setState((prev) => ({ ...prev, data: typeof update === "function" ? update(prev.data) : update }));
  }, []);

  const settled = state.key === key;
  return {
    data: settled && state.error ? undefined : state.data,
    error: settled ? state.error : null,
    loading: !settled,
    reload,
    setData,
  };
}
