export default function Spinner({ className = "size-5" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-70 ${className}`}
    />
  );
}
