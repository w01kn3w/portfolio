import { useState } from "react";

const nodes = [
  {
    title: "Client",
    detail:
      "An accessible interface collects input and shows loading, success and failure states.",
    code: "React · browser validation",
  },
  {
    title: "API",
    detail:
      "A request boundary checks the origin, content type, body size and rate limits before accepting input.",
    code: "POST /api/contact",
  },
  {
    title: "Business logic",
    detail:
      "Validated contact details become a plain-text message. Delivery is confirmed only when the SMTP server accepts it.",
    code: "Validation → mail delivery",
  },
  {
    title: "Database",
    detail:
      "Optional persistence for a product that needs it. This portfolio does not store enquiries in a database.",
    code: "Reference only · no database here",
  },
  {
    title: "External services",
    detail:
      "SMTP credentials stay on the server. The interface receives a useful error when delivery is not configured.",
    code: "SMTP · environment configuration",
  },
];
export default function Architecture() {
  const [selected, setSelected] = useState(1);
  return (
    <div className="architecture">
      <div className="architecture-top">
        <span>Reference architecture</span>
        <span>Explore each layer</span>
      </div>
      <div className="architecture-flow" aria-label="Architecture layers">
        {nodes.map((node, i) => (
          <button
            type="button"
            key={node.title}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
          >
            <span className="node-symbol" aria-hidden="true">
              {i === 0 ? (
                <svg viewBox="0 0 48 48">
                  <rect x="7" y="9" width="34" height="25" rx="2" />
                  <path d="M18 41h12M24 34v7M7 28h34" />
                </svg>
              ) : i === 3 ? (
                <svg viewBox="0 0 48 48">
                  <ellipse cx="24" cy="11" rx="15" ry="6" />
                  <path d="M9 11v25c0 8 30 8 30 0V11M9 23c0 8 30 8 30 0" />
                </svg>
              ) : (
                <svg viewBox="0 0 48 48">
                  <path
                    d={
                      i === 1
                        ? "m18 13-11 11 11 11m12-22 11 11-11 11M27 8l-6 32"
                        : i === 2
                          ? "m24 5 17 10v18L24 43 7 33V15ZM7 15l17 10 17-10M24 25v18"
                          : "M24 8v14M8 38V25h32v13M24 25v13"
                    }
                  />
                </svg>
              )}
            </span>
            <span>{node.title}</span>
            <span className="node-dot" />
          </button>
        ))}
      </div>
      <div className="architecture-detail" aria-live="polite">
        <h3>{nodes[selected].title}</h3>
        <p>{nodes[selected].detail}</p>
        <code>{nodes[selected].code}</code>
      </div>
      <details className="api-example">
        <summary>
          Try the implemented endpoint <span>Request / response</span>
        </summary>
        <div>
          <pre>
            <code>{`POST /api/contact\nContent-Type: application/json\n\n{\n  "name": "Your name",\n  "email": "you@example.com",\n  "message": "Tell me about your project and goals.",\n  "website": ""\n}`}</code>
          </pre>
          <div>
            <h4>When mail is not configured</h4>
            <p>
              The endpoint returns HTTP 503. This is a real failure state, not a
              sample success response.
            </p>
            <p>
              Static GitHub Pages hosting cannot run this endpoint. The Node
              service and SMTP settings are required for sending.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
