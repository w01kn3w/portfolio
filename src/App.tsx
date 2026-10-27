import { lazy, Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Orbit from "./Orbit";
import Cursor from "./Cursor";
import { profile, technologies } from "./content";

const Architecture = lazy(() => import("./Architecture"));
const emailDraftMode = import.meta.env.VITE_CONTACT_MODE === "email";
const contactUnavailable = import.meta.env.VITE_CONTACT_MODE === "unavailable";
class ContactError extends Error {}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} />
    </svg>
  );
}

function Contact() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState("");
  const [copy, setCopy] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    if (emailDraftMode) {
      if (fields.website) return;
      const subject = encodeURIComponent(
        `Project enquiry from ${String(fields.name).trim()}`,
      );
      const body = encodeURIComponent(
        `Name: ${String(fields.name).trim()}\nReply to: ${String(fields.email).trim()}\n\n${String(fields.message).trim()}`,
      );
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setFeedback(
        "Complete sending in your email app. If no draft appears, use the email link.",
      );
      return;
    }
    setState("sending");
    setFeedback("");
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        if (response.status === 429)
          throw new ContactError(
            "Too many requests. Please wait before trying again.",
          );
        if (response.status === 400)
          throw new ContactError(
            "Please check your name, email and message, then try again.",
          );
        throw new ContactError(
          "Message delivery is not available right now. Please use the email link.",
        );
      }
      const result: { success?: boolean } = await response.json();
      if (!result.success)
        throw new ContactError(
          "Delivery could not be confirmed. Please use the email link.",
        );
      setState("success");
      setFeedback("Message sent. Thank you for sharing your project.");
      form.reset();
    } catch (error) {
      setState("error");
      setFeedback(
        error instanceof ContactError
          ? error.message
          : "The server did not confirm delivery. Please use the email link or try again later.",
      );
    }
  }
  if (contactUnavailable)
    return (
      <section
        className="contact section-width"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div className="contact-heading">
          <h2 id="contact-title">
            Have a problem
            <br />
            worth <em>solving?</em>
          </h2>
        </div>
        <p className="contact-intro">Contact details are being set up.</p>
        <p className="muted">
          A direct way to get in touch will appear here soon.
        </p>
        <a className="text-link" href={profile.source}>
          Explore the source <Arrow diagonal />
        </a>
      </section>
    );
  return (
    <section
      className="contact section-width"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-heading">
        <h2 id="contact-title">
          Have a problem
          <br />
          worth <em>solving?</em>
        </h2>
        <a
          className="contact-orbit"
          href={`mailto:${profile.email}`}
          aria-label="Write an email"
        >
          <Arrow diagonal />
        </a>
      </div>
      <div className="contact-layout">
        <div>
          <p className="contact-intro">
            Let's turn your idea into a reliable digital product.
          </p>
          <p className="muted">
            Tell me what you want to build, what needs fixing, and what a good
            result looks like.
          </p>
          <a className="email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="contact-socials">
            <a
              className="text-link"
              href={profile.instagram}
              data-cursor="OPEN"
            >
              Instagram · @{profile.instagramHandle} <Arrow diagonal />
            </a>
            <a className="text-link" href={`tel:${profile.phone}`}>
              Phone · {profile.phone} <Arrow diagonal />
            </a>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(profile.email);
                setCopy("Email copied.");
              } catch {
                setCopy("Copy unavailable. Select the address above.");
              }
            }}
          >
            Copy email <Arrow />
          </button>
          <span role="status" className="feedback">
            {copy}
          </span>
          <p className="contact-note">
            {emailDraftMode
              ? "The form creates a draft in your email app. Review and send it there."
              : "Email address provided in this repository. Message delivery requires server configuration."}
          </p>
        </div>
        <form onSubmit={submit} className="contact-form">
          <div className="form-row">
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Alex Morgan"
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="alex@company.com"
              />
            </label>
          </div>
          <label>
            What are you working on?
            <textarea
              name="message"
              required
              minLength={20}
              maxLength={5000}
              rows={3}
              placeholder="A little about your project, timeline and the problem to solve…"
            />
          </label>
          <div className="honeypot" aria-hidden="true">
            <label>
              Leave this field empty
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="form-end">
            <span>
              {emailDraftMode
                ? "Opens your email app. Nothing is sent automatically."
                : "Only used to reply to your enquiry."}
            </span>
            <button
              className="button primary"
              disabled={state === "sending"}
              type="submit"
            >
              {emailDraftMode
                ? "Create email draft"
                : state === "sending"
                  ? "Sending…"
                  : "Send enquiry"}
              <Arrow diagonal />
            </button>
          </div>
          <p className={`feedback ${state}`} role="status" aria-live="polite">
            {feedback}
          </p>
        </form>
      </div>
    </section>
  );
}

function CaseStudy() {
  return (
    <section
      id="work"
      className="work section-width"
      aria-labelledby="work-title"
    >
      <div className="section-head">
        <h2 id="work-title">
          Built to be
          <br />
          <em>explored.</em>
        </h2>
        <p>
          A closer look at the code.
          <br />
          One verified project, open for inspection.
        </p>
      </div>
      <article className="project">
        <a
          href="#case-study"
          className="project-art"
          onClick={() => {
            const details = document.getElementById("case-study");
            if (details instanceof HTMLDetailsElement) details.open = true;
          }}
          data-cursor="VIEW"
        >
          <div className="art-top">
            <span>ATAJAN / WEB EXPERIENCE</span>
            <Arrow diagonal />
          </div>
          <div className="study-art">
            <div className="study-axis" />
            <div className="study-rings">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ transform: `rotate(${i * 15}deg)` }} />
              ))}
            </div>
            <div className="study-type">
              Ideas.
              <br />
              <span>Engineered.</span>
            </div>
            <span className="art-coordinate">
              INTERACTION STUDY / CANVAS 2D
            </span>
          </div>
          <div className="art-bottom">
            <span>Personal portfolio</span>
            <span>
              Explore the build <Arrow />
            </span>
          </div>
        </a>
        <div className="project-info">
          <div>
            <span className="project-kind">
              Creative development / Personal project
            </span>
            <h3>Atajan. A digital workspace.</h3>
            <p>
              A lightweight, interactive portfolio that puts the implementation
              in view. Expressive on the surface, deliberate underneath.
            </p>
          </div>
          <a className="text-link" href={profile.source} data-cursor="OPEN">
            Inspect the source <Arrow diagonal />
          </a>
        </div>
        <details className="case-details" id="case-study">
          <summary>
            Inside the build{" "}
            <span>
              Problem, architecture & decisions <Arrow />
            </span>
          </summary>
          <div className="case-grid">
            <div>
              <h4>The problem</h4>
              <p>
                Present technical work without burying it behind animation or
                unsupported claims. Keep the experience usable on a phone, with
                a keyboard, and with motion turned off.
              </p>
              <h4>The approach</h4>
              <p>
                React components and typed content, with an optional Canvas
                sculpture. The contact server is a separate Node process, so the
                static experience does not depend on email infrastructure.
              </p>
            </div>
            <div>
              <h4>Implementation scope</h4>
              <p>
                Frontend, interaction design, contact API and deployment
                configuration in this repository. No client work, commercial
                outcomes or production backend experience is implied.
              </p>
              <h4>Engineering decisions</h4>
              <ul>
                <li>
                  Canvas 2D instead of a WebGL runtime for the line sculpture.
                </li>
                <li>
                  Animation pauses offscreen and when the document is hidden.
                </li>
                <li>
                  Server validation, bounded requests and SMTP-only success.
                </li>
                <li>
                  Static hosting supported; sending requires the Node service.
                </li>
              </ul>
            </div>
            <div className="case-stack">
              <h4>Verified in source</h4>
              <p>
                React · TypeScript · Vite · CSS · Canvas · Node.js · GitHub
                Actions
              </p>
              <a className="text-link" href={profile.source}>
                Repository <Arrow diagonal />
              </a>
              <p className="muted">
                Visual above is an original interaction study for this website.
                No client screenshots or sample business metrics.
              </p>
            </div>
          </div>
        </details>
      </article>
      <p className="archive-note">
        More work will join this archive when its source and scope can be
        verified.
      </p>
    </section>
  );
}

const steps = [
  [
    "Understand",
    "Start with the problem.",
    "Define who needs it, what should change, and the constraints that matter.",
  ],
  [
    "Architect",
    "Make the boundaries clear.",
    "Map responsibilities, data and integrations before adding complexity.",
  ],
  [
    "Build",
    "Work in useful increments.",
    "Keep the implementation readable and the important decisions visible.",
  ],
  [
    "Test",
    "Check the real behaviour.",
    "Exercise the critical flows, failure cases and devices people actually use.",
  ],
  [
    "Deploy",
    "Make release repeatable.",
    "Validate the build, check the running service and keep a rollback path.",
  ],
] as const;

export default function App() {
  const [step, setStep] = useState(0);
  const [techGroup, setTechGroup] = useState<string | null>("Frontend");
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            if (!motion.matches)
              entry.target.animate(
                [
                  { opacity: 0.5, transform: "translateY(22px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" },
              );
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(".project-art,.process")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  const isNotFound =
    window.location.pathname !== import.meta.env.BASE_URL &&
    window.location.pathname !== `${import.meta.env.BASE_URL}index.html`;
  if (isNotFound)
    return (
      <main className="not-found section-width">
        <span className="wordmark">
          Atajan<span>.</span>
        </span>
        <p>404 / Page not found</p>
        <h1>
          A wrong turn.
          <br />
          <em>A way back.</em>
        </h1>
        <a className="button primary" href={import.meta.env.BASE_URL}>
          Back to the portfolio <Arrow />
        </a>
      </main>
    );
  return (
    <>
      <Cursor />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" className="opening">
        <header className="site-header section-width">
          <a href="#top" className="wordmark" aria-label="Atajan home">
            Atajan<span>.</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#engineering">Engineering</a>
            <a href="#about">About</a>
            <a className="nav-contact" href="#contact">
              Let's talk <Arrow diagonal />
            </a>
          </nav>
        </header>
        <main id="main">
          <section className="hero section-width" aria-labelledby="hero-title">
            <div className="hero-topline">
              <p>Freelance full-stack developer</p>
              <span>Independent thinking. Practical engineering.</span>
            </div>
            <div className="hero-stage">
              <h1 id="hero-title">
                Engineering
                <br />
                <span>digital experiences</span>
                <br />
                <em>that work.</em>
              </h1>
              <Orbit />
            </div>
            <div className="hero-base">
              <p>
                Full-stack development, backend systems and automation
                engineered for real-world impact.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="#work" data-magnetic>
                  Explore my work <Arrow />
                </a>
                <a className="text-link" href="#contact">
                  Let's build something <Arrow diagonal />
                </a>
              </div>
            </div>
            <div className="hero-foot">
              <span>Built with intention. Open to inspection.</span>
              <a href="#work">
                Scroll to explore <span className="scroll-line" />
              </a>
            </div>
          </section>
          <CaseStudy />
          <section id="engineering" className="engineering">
            <div className="section-width">
              <div className="section-head">
                <h2>
                  Good interfaces.
                  <br />
                  <em>Solid foundations.</em>
                </h2>
                <p>
                  The experience extends beyond the screen.
                  <br />
                  Data, integrations and failure states matter too.
                </p>
              </div>
              <Suspense
                fallback={
                  <p className="loading" role="status">
                    Loading the architecture explorer…
                  </p>
                }
              >
                <Architecture />
              </Suspense>
              <div className="engineering-note">
                <span>Implemented here</span>
                <p>
                  A Node.js contact endpoint with input validation, request
                  limits and server-side SMTP configuration. An unconfigured
                  mail service returns an error, never a false confirmation.
                </p>
                <a className="text-link" href={profile.source}>
                  Read the implementation <Arrow diagonal />
                </a>
              </div>
            </div>
          </section>
          <section id="about" className="about section-width">
            <div className="about-intro">
              <h2>
                Curiosity in.
                <br />
                <em>Working software out.</em>
              </h2>
              <div>
                <p className="large-copy">
                  I'm Atajan, a freelance full-stack developer focused on useful
                  digital products.
                </p>
                <p>
                  I work across interfaces, backend systems, API integrations
                  and automation. My approach is practical: understand the
                  problem, make the structure clear, and build something people
                  can use.
                </p>
                <a className="text-link" href="#contact">
                  Tell me about your project <Arrow diagonal />
                </a>
              </div>
            </div>
            <div className="process">
              <div
                className="process-tabs"
                role="tablist"
                aria-label="Development process"
              >
                {steps.map(([title], i) => (
                  <button
                    key={title}
                    role="tab"
                    id={`step-${i}`}
                    aria-controls="step-panel"
                    aria-selected={step === i}
                    tabIndex={step === i ? 0 : -1}
                    onClick={() => setStep(i)}
                    onKeyDown={(event) => {
                      const next =
                        event.key === "ArrowRight"
                          ? (i + 1) % steps.length
                          : event.key === "ArrowLeft"
                            ? (i + steps.length - 1) % steps.length
                            : event.key === "Home"
                              ? 0
                              : event.key === "End"
                                ? steps.length - 1
                                : null;
                      if (next !== null) {
                        event.preventDefault();
                        setStep(next);
                        document.getElementById(`step-${next}`)?.focus();
                      }
                    }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {title}
                    <Arrow />
                  </button>
                ))}
              </div>
              <div
                className="process-description"
                role="tabpanel"
                id="step-panel"
                aria-labelledby={`step-${step}`}
                tabIndex={0}
              >
                <h3>{steps[step][1]}</h3>
                <p>{steps[step][2]}</p>
              </div>
            </div>
            <div className="stack">
              <h3>
                The tools behind
                <br />
                this experience.
              </h3>
              <div className="stack-map">
                {technologies.map((group) => (
                  <div className="stack-row" key={group.category}>
                    <button
                      type="button"
                      aria-expanded={techGroup === group.category}
                      aria-controls={`tech-${group.category.split(" ")[0]}`}
                      onClick={() =>
                        setTechGroup(
                          techGroup === group.category ? null : group.category,
                        )
                      }
                    >
                      {group.category}
                      <Arrow />
                    </button>
                    <p>
                      {group.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </p>
                    {techGroup === group.category && (
                      <div
                        className="tech-evidence"
                        id={`tech-${group.category.split(" ")[0]}`}
                      >
                        <p>
                          {group.category === "Databases"
                            ? "Database-backed projects will appear when their source can be verified."
                            : group.category === "Backend"
                              ? "Implemented in this repository's contact service. SMTP requires server configuration."
                              : group.category === "Frontend"
                                ? "Used for this interface, typed content and the pointer-responsive line sculpture."
                                : group.category === "Infrastructure"
                                  ? "Build and static deployment are configured in this repository. VPS publication requires owner access."
                                  : "Used to version, check and test this build. Explore the source to inspect the configuration."}
                        </p>
                        <a className="text-link" href={profile.source}>
                          Inspect the repository <Arrow diagonal />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="stack-note">
              Select a category to see how it is used in this build.
            </p>
          </section>
          <Contact />
        </main>
        <footer className="site-footer section-width">
          <a className="wordmark" href="#top">
            Atajan<span>.</span>
          </a>
          <span>Thoughtfully built. © {new Date().getFullYear()} Atajan.</span>
          <a href={profile.source} data-cursor="OPEN">
            GitHub <Arrow diagonal />
          </a>
          <a href="#top">
            Back to top <Arrow />
          </a>
        </footer>
      </div>
    </>
  );
}
