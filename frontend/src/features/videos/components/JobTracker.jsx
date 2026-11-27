import { useEffect } from "react";

import useVideoJob from "../hooks/useVideoJob";
import DetectionResults from "./DetectionResults";
import ProcessingStatus from "./ProcessingStatus";

// Follows one processing job. Key by job id so each job gets its own poller.
export default function JobTracker({ initialJob, onUpdate }) {
  const { job, pollError, retry } = useVideoJob(initialJob);

  useEffect(() => {
    onUpdate(job);
  }, [job, onUpdate]);

  return (
    <div className="flex flex-col gap-6">
      <ProcessingStatus status={job.status} job={job} pollError={pollError} onRetryPoll={retry} />
      {job.status === "COMPLETED" && job.summary && <DetectionResults job={job} />}
    </div>
  );
}
