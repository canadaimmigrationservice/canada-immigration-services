export function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatFileSize(bytes) {
  if (!bytes || bytes < 0) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "—";
  }

  return items.filter(Boolean).join(", ");
}

export function getStatusClass(status) {
  if (!status) {
    return "status-neutral";
  }

  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("approved") ||
    normalizedStatus.includes("completed") ||
    normalizedStatus.includes("received")
  ) {
    return "status-success";
  }

  if (
    normalizedStatus.includes("rejected") ||
    normalizedStatus.includes("closed")
  ) {
    return "status-danger";
  }

  if (
    normalizedStatus.includes("progress") ||
    normalizedStatus.includes("assessing") ||
    normalizedStatus.includes("required") ||
    normalizedStatus.includes("requested") ||
    normalizedStatus.includes("under review")
  ) {
    return "status-warning";
  }

  if (
    normalizedStatus.includes("submitted") ||
    normalizedStatus.includes("pending") ||
    normalizedStatus.includes("not started")
  ) {
    return "status-info";
  }

  return "status-neutral";
}
