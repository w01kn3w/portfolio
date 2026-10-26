import { useState } from "react";
import Orbit from "./Orbit";
import { profile, projects } from "./content";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} />
    </svg>
  );
}

export default function App() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <div className="opening" id="top">
        <header className="site-header page-width">
          <a className="wordmark" href="#top" aria-label="Atajan, на главную">
            a<span className="wordmark-dot" />
          </a>
          <nav aria-label="Основная навигация">
            <a href="#work">
              Проекты <span>{String(projects.length).padStart(2, "0")}</span>
            </a>
            <a href="#about">Обо мне</a>
            <a href="#contact">
              Написать <Arrow diagonal />
            </a>
          </nav>
        </header>
        <main id="main">
          <section className="hero page-width" aria-labelledby="hero-title">
            <div className="name-line">
              <h1 id="hero-title">
                {profile.name}
                <span className="name-period">.</span>
              </h1>
              <span className="name-note">
                Личное
                <br />
                пространство
                <br />в интернете
              </span>
            </div>
            <div className="hero-lower">
              <div className="hero-copy">
                <h2>
                  Из любопытства —<br />в реальные вещи.
                </h2>
                <p>
                  Привет, я Atajan. Здесь собираю свои проекты и пробую новое.
                  Мне интересно, как идея становится чем-то, что можно открыть,
                  потрогать и использовать.
                </p>
                <a className="solid-link" href="#work">
                  Посмотреть проекты <Arrow />
                </a>
              </div>
              <Orbit />
            </div>
            <div className="hero-bottom">
              <span>Всегда есть что попробовать.</span>
              <a href="#work" aria-label="Перейти к проектам">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v16m-6-6 6 6 6-6" />
                </svg>
              </a>
              <span>Портфолио / 2026</span>
            </div>
          </section>
          <section
            className="work-section"
            id="work"
            aria-labelledby="work-title"
          >
            <div className="page-width">
              <div className="section-heading">
                <h2 id="work-title">
                  Сделано.
                  <br />
                  <span>И продолжается.</span>
                </h2>
                <p>
                  Небольшая коллекция.
                  <br />У каждой работы — своё начало.
                </p>
              </div>
              {projects.map((project) => (
                <article className="project" key={project.slug}>
                  <a
                    className="project-art"
                    href={project.sourceUrl}
                    aria-label={`${project.title} — исходный код на GitHub`}
                  >
                    {project.preview === "portfolio" ? (
                      <div className="mini-site" aria-hidden="true">
                        <div className="mini-header">
                          <span>a.</span>
                          <span>Идеи в действии</span>
                        </div>
                        <span className="mini-name">Atajan.</span>
                        <div className="mini-bottom">
                          <span>
                            Всё начинается
                            <br />с любопытства.
                          </span>
                          <div className="mini-orb">
                            {Array.from({ length: 15 }, (_, i) => (
                              <i
                                key={i}
                                style={{ transform: `rotate(${i * 12}deg)` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="generic-preview">
                        <span>{project.title}</span>
                        <span>{project.technologies.join(" / ")}</span>
                      </div>
                    )}
                    <span className="art-label">
                      Открыть исходный код <Arrow diagonal />
                    </span>
                  </a>
                  <div className="project-info">
                    <div className="project-meta">
                      <span>{project.category}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <ul className="tags" aria-label="Технологии">
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                    <div className="project-links">
                      <a className="text-link" href={project.sourceUrl}>
                        Код на GitHub <Arrow diagonal />
                      </a>
                      {project.liveUrl && (
                        <a className="text-link" href={project.liveUrl}>
                          Открыть сайт <Arrow diagonal />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              <div className="next-project">
                <div className="next-mark" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <div>
                  <h3>Место для следующего.</h3>
                  <p>Новые работы появятся здесь, когда будут готовы.</p>
                </div>
                <a href={profile.github} className="text-link">
                  Мой GitHub <Arrow diagonal />
                </a>
              </div>
            </div>
          </section>
          <section
            className="about-section"
            id="about"
            aria-labelledby="about-title"
          >
            <div className="page-width about-layout">
              <h2 id="about-title">
                В процессе.
                <br />И мне это нравится.
              </h2>
              <div className="about-copy">
                <p className="about-lead">Это портфолио — тоже начало.</p>
                <p>
                  Я оставляю здесь место для экспериментов, новых задач и
                  собственных проектов. Хочется делать вещи, в которых продуманы
                  и детали, и то, как ими пользуются.
                </p>
                <p>
                  По мере появления работ буду добавлять их сюда: с описанием,
                  ссылками и кодом, когда его можно открыть.
                </p>
                <a href={profile.github} className="text-link">
                  Посмотреть, над чем работаю <Arrow diagonal />
                </a>
              </div>
            </div>
          </section>
          <section
            className="contact-section"
            id="contact"
            aria-labelledby="contact-title"
          >
            <div className="page-width">
              <div className="contact-top">
                <h2 id="contact-title">
                  Есть идея?
                  <br />
                  Давайте обсудим<span>.</span>
                </h2>
                <a
                  className="contact-arrow"
                  href={`mailto:${profile.email}`}
                  aria-label="Написать письмо"
                >
                  <Arrow diagonal />
                </a>
              </div>
              <div className="contact-bottom">
                <a className="email-link" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                <div className="copy-area">
                  <button
                    className="copy-button"
                    type="button"
                    onClick={copyEmail}
                  >
                    Скопировать адрес
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M15 8V4H4v11h4" />
                    </svg>
                  </button>
                  <span className="copy-status" role="status">
                    {copyState === "copied"
                      ? "Адрес скопирован"
                      : copyState === "failed"
                        ? "Не удалось. Выделите адрес и скопируйте вручную."
                        : ""}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="site-footer page-width">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <a href={profile.github}>
            GitHub <Arrow diagonal />
          </a>
          <a href="#top">
            Наверх{" "}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20V4m-6 6 6-6 6 6" />
            </svg>
          </a>
        </footer>
      </div>
    </>
  );
}
