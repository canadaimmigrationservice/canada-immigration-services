import { formatDateTime } from "../lib/formatters";

function ApplicationMessages({ messages = [] }) {
  return (
    <section className="card">
      <div className="section-heading">
        <span className="eyebrow">Communication</span>
        <h2>Messages</h2>
      </div>

      {messages.length === 0 ? (
        <p>No messages are currently available.</p>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <article className="message-item" key={message.id}>
              <div className="message-header">
                <strong>Message</strong>
                <span>{formatDateTime(message.created_at)}</span>
              </div>

              <p>{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ApplicationMessages;
