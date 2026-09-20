function AlertMessage({
  type = "info",
  title,
  message
}) {
  return (
    <div
      className={`alert alert-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {title && <strong>{title}</strong>}
      {message && <span>{message}</span>}
    </div>
  );
}

export default AlertMessage;
