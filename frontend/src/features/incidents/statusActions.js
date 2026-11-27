// Which review actions an operator can take from each status, and how each is confirmed.

export const STATUS_ACTIONS = {
  VERIFY: {
    to: "VERIFIED",
    label: "Verify",
    variant: "primary",
    title: "Verify this incident?",
    description: "Confirms the detection is a real issue. It stays on the public map as verified until resolved.",
    noteLabel: "Note (optional)",
  },
  REJECT: {
    to: "REJECTED",
    label: "Reject",
    variant: "danger",
    title: "Reject this detection?",
    description: "Marks the detection as a false positive and removes it from the public portal.",
    noteLabel: "Reason for rejection",
    noteRequired: true,
  },
  RESOLVE: {
    to: "RESOLVED",
    label: "Mark resolved",
    variant: "success",
    title: "Mark this incident as resolved?",
    description: "Records that the issue has been fixed on the ground. The public map will show it as resolved.",
    noteLabel: "Resolution note (optional)",
  },
};

const BY_STATUS = {
  PENDING: ["VERIFY", "REJECT"],
  VERIFIED: ["RESOLVE", "REJECT"],
  RESOLVED: [],
  REJECTED: [],
};

export function actionsFor(status) {
  return BY_STATUS[status] ?? [];
}

export const REVIEWER_ROLES = ["ADMIN", "OPERATOR"];
