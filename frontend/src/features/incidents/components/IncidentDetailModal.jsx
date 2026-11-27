import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../../../shared/components/Button";
import EvidenceImage from "../../../shared/components/EvidenceImage";
import Modal from "../../../shared/components/Modal";
import { STATUS_ACTIONS, actionsFor } from "../statusActions";
import IncidentFacts from "./IncidentFacts";
import IncidentTimeline from "./IncidentTimeline";

export default function IncidentDetailModal({ incident, canReview, onAction, onClose }) {
  const actions = canReview ? actionsFor(incident.status) : [];

  return (
    <Modal
      open
      size="xl"
      title={`Incident ${incident.ref}`}
      description={incident.location.address}
      onClose={onClose}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {incident.status !== "REJECTED" ? (
            <Link to={`/issues/${incident.id}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-mute hover:text-ink">
              <ExternalLink className="size-3.5" />
              Public page
            </Link>
          ) : (
            <span className="text-xs text-mute">Hidden from the public portal</span>
          )}
          <div className="flex gap-2">
            {actions.length === 0 && (
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}
            {actions.map((key) => (
              <Button key={key} variant={STATUS_ACTIONS[key].variant} onClick={() => onAction(incident, key)}>
                {STATUS_ACTIONS[key].label}
              </Button>
            ))}
          </div>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <EvidenceImage incident={incident} className="aspect-video w-full rounded-lg" />
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">History</h3>
            <IncidentTimeline history={incident.history} />
          </div>
        </div>
        <IncidentFacts incident={incident} />
      </div>
    </Modal>
  );
}
