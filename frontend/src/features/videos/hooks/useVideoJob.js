import { useCallback, useEffect, useState } from "react";

import { getVideoStatus } from "../video.service";

const POLL_MS = 2000;
const DONE = ["COMPLETED", "FAILED"];

// Polls GET /api/videos/:id/status until the job completes or fails. Results
// are only ever what the backend reports; nothing is assumed client-side.
// Mount once per job (key the component by job id).
export default function useVideoJob(initialJob) {
  const [job, setJob] = useState(initialJob);
  const [pollError, setPollError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [{ id: jobId, status: initialStatus }] = useState(initialJob);

  useEffect(() => {
    if (!jobId || DONE.includes(initialStatus)) return;
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        const next = await getVideoStatus(jobId);
        if (cancelled) return;
        setJob(next);
        if (!DONE.includes(next.status)) timer = setTimeout(poll, POLL_MS);
      } catch (error) {
        if (!cancelled) setPollError(error);
      }
    }

    timer = setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, initialStatus, attempt]);

  const retry = useCallback(() => {
    setPollError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { job, pollError, retry };
}
