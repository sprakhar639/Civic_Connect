import { MapPinOff } from "lucide-react";

import { ButtonLink } from "./Button";
import EmptyState from "./EmptyState";

export default function NotFound({ admin = false }) {
  return (
    <EmptyState
      icon={MapPinOff}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      className="py-24"
      action={
        <ButtonLink to={admin ? "/admin/dashboard" : "/"} variant="secondary">
          {admin ? "Back to overview" : "Back to home"}
        </ButtonLink>
      }
    />
  );
}
