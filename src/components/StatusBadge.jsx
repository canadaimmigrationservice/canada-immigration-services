import { getStatusClass } from "../lib/formatters";

function StatusBadge({ status }) {
  if (!status) {
    return <span className="status-badge status-neutral">—</span>;
  }

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
