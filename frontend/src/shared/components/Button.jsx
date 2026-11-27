import { Link } from "react-router-dom";

import { buttonClass } from "./buttonClass";
import Spinner from "./Spinner";

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
