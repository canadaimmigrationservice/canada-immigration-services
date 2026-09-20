function ErrorMessage({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="alert alert-error" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
