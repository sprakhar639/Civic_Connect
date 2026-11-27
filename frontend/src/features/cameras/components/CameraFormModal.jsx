import { useState } from "react";

import { CAMERA_SOURCES, CAMERA_STATUSES } from "../../../config/domain";
import Button from "../../../shared/components/Button";
import { Input, Select } from "../../../shared/components/FormField";
import Modal from "../../../shared/components/Modal";
import LocationPicker from "../../map/components/LocationPicker";

function toForm(camera) {
  return {
    id: camera?.id ?? "",
    name: camera?.name ?? "",
    address: camera?.location.address ?? "",
    area: camera?.location.area ?? "",
    lat: camera?.location.lat?.toString() ?? "",
    lng: camera?.location.lng?.toString() ?? "",
    streamUrl: camera?.streamUrl ?? "",
    source: camera?.source ?? "SIMULATED",
    status: camera?.status ?? "ONLINE",
  };
}

function validate(form) {
  const errors = {};
  if (form.id && !/^[A-Za-z0-9-]{3,32}$/.test(form.id)) errors.id = "Use 3–32 letters, numbers or dashes.";
  if (!form.name.trim()) errors.name = "Give the camera a name.";
  if (!form.streamUrl.trim()) errors.streamUrl = "Enter the recording path or stream URL.";
  const lat = Number(form.lat);
  const lng = Number(form.lng);
  if (form.lat === "" || !Number.isFinite(lat) || lat < -90 || lat > 90) errors.lat = "Latitude must be between -90 and 90.";
  if (form.lng === "" || !Number.isFinite(lng) || lng < -180 || lng > 180) errors.lng = "Longitude must be between -180 and 180.";
  return errors;
}

// Add or edit a camera. `onSave` receives the API payload and may throw.
export default function CameraFormModal({ camera, onSave, onClose }) {
  const isEdit = Boolean(camera);
  const [form, setForm] = useState(() => toForm(camera));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      name: form.name.trim(),
      streamUrl: form.streamUrl.trim(),
      location: {
        address: form.address.trim() || undefined,
        area: form.area.trim() || undefined,
        lat: Number(form.lat),
        lng: Number(form.lng),
      },
      source: form.source,
      status: form.status,
    };
    if (!isEdit && form.id.trim()) payload.id = form.id.trim().toUpperCase();

    setSaving(true);
    setFormError("");
    try {
      await onSave(payload);
    } catch (error) {
      setFormError(error.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      size="lg"
      title={isEdit ? `Edit ${camera.id}` : "Add camera"}
      description={isEdit ? camera.name : "Register a camera location. Use a simulated feed for recorded footage."}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="camera-form" loading={saving}>
            {isEdit ? "Save changes" : "Add camera"}
          </Button>
        </>
      }
    >
      <form id="camera-form" onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
            {formError}
          </p>
        )}
        {!isEdit && (
          <Input
            id="camera-id"
            label="Camera ID"
            placeholder="Auto-generated if empty"
            value={form.id}
            onChange={set("id")}
            error={errors.id}
            hint="e.g. CAM-BLR-013"
          />
        )}
        <Input id="camera-name" label="Name" value={form.name} onChange={set("name")} error={errors.name} placeholder="Koramangala junction camera" className={isEdit ? "sm:col-span-2" : ""} />
        <Input
          id="camera-stream"
          label="Recording or stream URL"
          value={form.streamUrl}
          onChange={set("streamUrl")}
          error={errors.streamUrl}
          placeholder={form.source === "CCTV" ? "rtsp://…" : "recordings/koramangala-0900.mp4"}
          hint="Where the AI service reads footage from."
          className="sm:col-span-2"
        />
        <Input id="camera-address" label="Street address" value={form.address} onChange={set("address")} placeholder="Optional" className="sm:col-span-2" />
        <Input id="camera-area" label="Area / locality" value={form.area} onChange={set("area")} placeholder="Optional" />
        <div className="grid grid-cols-2 gap-3">
          <Input id="camera-lat" label="Latitude" inputMode="decimal" value={form.lat} onChange={set("lat")} error={errors.lat} />
          <Input id="camera-lng" label="Longitude" inputMode="decimal" value={form.lng} onChange={set("lng")} error={errors.lng} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-xs font-semibold text-slate-700">Or click the map to set the position</p>
          <LocationPicker
            value={{ lat: Number(form.lat), lng: Number(form.lng) }}
            onPick={({ lat, lng }) => {
              setForm((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
              setErrors((prev) => ({ ...prev, lat: undefined, lng: undefined }));
            }}
          />
        </div>
        <Select
          id="camera-source"
          label="Feed source"
          value={form.source}
          onChange={set("source")}
          options={Object.entries(CAMERA_SOURCES).map(([value, meta]) => ({ value, label: meta.label }))}
          hint={CAMERA_SOURCES[form.source].description}
        />
        <Select
          id="camera-status"
          label="Status"
          value={form.status}
          onChange={set("status")}
          options={Object.entries(CAMERA_STATUSES).map(([value, meta]) => ({ value, label: meta.label }))}
        />
        {form.source === "CCTV" && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 sm:col-span-2">
            Live CCTV ingestion requires camera access from the city, which CivicConnect doesn&apos;t have yet. The camera will be
            registered, but no live footage will be processed until a stream is connected.
          </p>
        )}
      </form>
    </Modal>
  );
}
