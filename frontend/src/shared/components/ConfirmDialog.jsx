import Button from "./Button";
import Modal from "./Modal";

// Confirmation for destructive or important actions. `onConfirm` may be async;
// the dialog shows `error` from the parent if it fails.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "primary",
  loading = false,
  error,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? () => {} : onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm leading-relaxed text-slate-600">{description}</p>}
      {children}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </Modal>
  );
}
