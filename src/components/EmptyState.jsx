function EmptyState({
  title = "No information available",
  message = "There is currently no information to display."
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
