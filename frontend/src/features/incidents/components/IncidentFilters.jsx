import { INCIDENT_STATUSES, ISSUE_TYPES } from "../../../config/domain";
import SearchInput from "../../../shared/components/SearchInput";
import { DATE_RANGES } from "../../../shared/utils/incidents";

const selectClass =
  "h-10 rounded-lg border border-line bg-white px-3 pr-8 text-sm text-ink outline-none focus:border-brand focus:ring-3 focus:ring-brand/15";

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  );
}

// Search plus type/status/date filters. `statuses` limits the status options
// (the public portal never lists rejected incidents).
export default function IncidentFilters({
  filters,
  onChange,
  statuses = Object.keys(INCIDENT_STATUSES),
  showStatus = true,
  showDate = true,
  searchPlaceholder = "Search by ID, location or camera",
  children,
}) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <SearchInput
        value={filters.query}
        onChange={set("query")}
        placeholder={searchPlaceholder}
        className="lg:max-w-sm lg:flex-1"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <FilterSelect
          label="Issue type"
          value={filters.type}
          onChange={set("type")}
          options={[["ALL", "All types"], ...Object.entries(ISSUE_TYPES).map(([key, meta]) => [key, meta.label])]}
        />
        {showStatus && (
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={set("status")}
            options={[["ALL", "All statuses"], ...statuses.map((key) => [key, INCIDENT_STATUSES[key].label])]}
          />
        )}
        {showDate && (
          <FilterSelect
            label="Detection date"
            value={filters.range}
            onChange={set("range")}
            options={Object.entries(DATE_RANGES).map(([key, meta]) => [key, meta.label])}
          />
        )}
        {children}
      </div>
    </div>
  );
}

export { FilterSelect };
