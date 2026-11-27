// Label, hint and error wrapper shared by Input, Select and Textarea.

const CONTROL =
  "w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:bg-slate-50 disabled:text-mute";

function controlClass(error, extra = "") {
  return `${CONTROL} ${error ? "border-red-400" : "border-line"} ${extra}`;
}

function Field({ id, label, error, hint, className = "", children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-mute">{hint}</span>
      )}
    </div>
  );
}

export function Input({ id, label, error, hint, className, inputClassName = "", ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClass(error, `h-10 ${inputClassName}`)}
        {...props}
      />
    </Field>
  );
}

export function Select({ id, label, error, hint, className, options, ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <select id={id} aria-invalid={Boolean(error)} className={controlClass(error, "h-10 pr-8")} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Textarea({ id, label, error, hint, className, ...props }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <textarea id={id} aria-invalid={Boolean(error)} className={controlClass(error, "min-h-20 py-2")} {...props} />
    </Field>
  );
}
