import { Camera, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CAMERA_SOURCES, CAMERA_STATUSES } from "../../../config/domain";
import { useToast } from "../../../context/ToastContext";
import useAsync from "../../../hooks/useAsync";
import { CameraStatusBadge, SourceBadge } from "../../../shared/components/Badge";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import Loader from "../../../shared/components/Loader";
import PageHeader from "../../../shared/components/PageHeader";
import SearchInput from "../../../shared/components/SearchInput";
import { formatDateTime, formatRelative } from "../../../shared/utils/format";
import { countBy } from "../../../shared/utils/incidents";
import { FilterSelect } from "../../incidents/components/IncidentFilters";
import { createCamera, deleteCamera, getCameras, updateCamera } from "../camera.service";
import CameraFormModal from "../components/CameraFormModal";

export default function Cameras() {
  const toast = useToast();
  const { data: cameras, loading, error, reload, setData } = useAsync(getCameras);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [editing, setEditing] = useState(null); // null | "new" | camera
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });

  const results = useMemo(() => {
    if (!cameras) return [];
    const needle = query.trim().toLowerCase();
    return cameras
      .filter((camera) => status === "ALL" || camera.status === status)
      .filter((camera) => source === "ALL" || camera.source === source)
      .filter(
        (camera) =>
          !needle ||
          [camera.id, camera.name, camera.location.address, camera.location.area].some((field) =>
            field?.toLowerCase().includes(needle),
          ),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [cameras, query, status, source]);

  const counts = useMemo(() => ({ ...countBy(cameras ?? [], "status"), ...countBy(cameras ?? [], "source") }), [cameras]);

  async function handleSave(payload) {
    if (editing === "new") {
      const camera = await createCamera(payload);
      setData((list) => [...list, camera]);
      toast(`Camera ${camera.id} added.`);
    } else {
      const camera = await updateCamera(editing.id, payload);
      setData((list) => list.map((item) => (item.id === camera.id ? camera : item)));
      toast(`Camera ${camera.id} updated.`);
    }
    setEditing(null);
  }

  async function handleDelete() {
    setDeleteState({ loading: true, error: "" });
    try {
      await deleteCamera(deleting.id);
      setData((list) => list.filter((camera) => camera.id !== deleting.id));
      toast(`Camera ${deleting.id} deleted.`);
      setDeleting(null);
      setDeleteState({ loading: false, error: "" });
    } catch (err) {
      setDeleteState({ loading: false, error: err.message });
    }
  }

  return (
    <>
      <PageHeader
        title="Camera management"
        description="Camera locations that feed footage into CivicConnect. Simulated feeds replay recorded video; they are not live CCTV."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Add camera
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
        <span><strong className="text-ink">{cameras?.length ?? "–"}</strong> cameras</span>
        <span><strong className="text-emerald-600">{counts.ONLINE ?? 0}</strong> online</span>
        <span><strong className="text-red-600">{counts.OFFLINE ?? 0}</strong> offline</span>
        <span><strong className="text-amber-600">{counts.SIMULATED ?? 0}</strong> simulated</span>
        <span><strong className="text-blue-600">{counts.CCTV ?? 0}</strong> live CCTV</span>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search ID, name or location" className="sm:max-w-sm sm:flex-1" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[["ALL", "All statuses"], ...Object.entries(CAMERA_STATUSES).map(([key, meta]) => [key, meta.label])]}
          />
          <FilterSelect
            label="Feed source"
            value={source}
            onChange={setSource}
            options={[["ALL", "All sources"], ...Object.entries(CAMERA_SOURCES).map(([key, meta]) => [key, meta.label])]}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading ? (
          <Loader label="Loading cameras…" />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Camera}
            title={cameras.length ? "No cameras match" : "No cameras yet"}
            description={cameras.length ? "Try a different search or filter." : "Add a camera location to start processing footage."}
            action={!cameras.length && <Button onClick={() => setEditing("new")}>Add camera</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-line bg-slate-50 text-left text-xs text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Camera</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Feed</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Last seen</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {results.map((camera) => (
                  <tr key={camera.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{camera.name}</p>
                      <p className="font-mono text-xs text-mute">{camera.id}</p>
                    </td>
                    <td className="max-w-64 px-3 py-3">
                      <p className="truncate text-slate-700" title={camera.location.address}>{camera.location.address}</p>
                      {camera.location.lat !== null && (
                        <p className="flex items-center gap-1 font-mono text-xs text-mute">
                          <MapPin className="size-3" />
                          {camera.location.lat.toFixed(4)}, {camera.location.lng.toFixed(4)}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <SourceBadge source={camera.source} />
                      {camera.streamUrl && (
                        <p className="mt-1 max-w-44 truncate font-mono text-[11px] text-mute" title={camera.streamUrl}>
                          {camera.streamUrl}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3"><CameraStatusBadge status={camera.status} /></td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap text-slate-600" title={formatDateTime(camera.lastSeenAt)}>
                      {formatRelative(camera.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(camera)} aria-label={`Edit ${camera.id}`} title="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:!bg-red-50 hover:!text-red-600"
                          onClick={() => setDeleting(camera)}
                          aria-label={`Delete ${camera.id}`}
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && (
        <CameraFormModal
          key={editing === "new" ? "new" : editing.id}
          camera={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.id}?`}
        description={`${deleting?.name} will be removed. Incidents already detected by this camera are kept. This can't be undone.`}
        confirmLabel="Delete camera"
        variant="danger"
        loading={deleteState.loading}
        error={deleteState.error}
        onConfirm={handleDelete}
        onClose={() => {
          setDeleting(null);
          setDeleteState({ loading: false, error: "" });
        }}
      />
    </>
  );
}
