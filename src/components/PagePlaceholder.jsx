function PagePlaceholder({ title, description }) {
  return (
    <main className="section">
      <div className="container">
        <div className="section-heading">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </main>
  );
}

export default PagePlaceholder;
