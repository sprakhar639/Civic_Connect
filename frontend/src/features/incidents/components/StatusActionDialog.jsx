import { useState } from "react";

import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { Textarea } from "../../../shared/components/FormField";
import { useToast } from "../../../context/ToastContext";
import { STATUS_ACTIONS } from "../statusActions";
import { updateIncidentStatus } from "../incident.service";

// Confirms a status change, collects an optional (or required) note, and calls the API.
// Mount with a `key` per incident+action so its form state starts fresh.
export default function StatusActionDialog({ incident, actionKey, onClose, onUpdated }) {
  const action = STATUS_ACTIONS[actionKey];
  const toast = useToast();
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (action.noteRequired && !note.trim()) {
      setNoteError("Please give a reason so other operators know why.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateIncidentStatus(incident.id, action.to, note.trim());
      onUpdated(updated);
      toast(`${incident.ref} marked as ${action.to.toLowerCase()}.`);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <ConfirmDialog
      open
      title={action.title}
      description={action.description}
      confirmLabel={action.label}
      variant={action.variant}
      loading={saving}
      error={error}
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-mono font-medium">{incident.ref}</span> · {incident.location.address}
      </p>
      <Textarea
        id="status-note"
        label={action.noteLabel}
        value={note}
        error={noteError}
        maxLength={300}
        onChange={(e) => {
          setNote(e.target.value);
          setNoteError("");
        }}
      />
    </ConfirmDialog>
  );
}
