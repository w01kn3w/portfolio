import { useState } from "react";
const layers = {
  en: [
    [
      "Interface",
      "Accessible pages and forms present published content and collect project inquiries.",
      "React · TypeScript",
    ],
    [
      "API",
      "The public content API exposes published snapshots. Administrative writes require the existing protected session.",
      "NestJS · Validation · RBAC",
    ],
    [
      "Data",
      "Projects, drafts, revisions and inquiries live alongside the existing business records.",
      "PostgreSQL · Prisma",
    ],
    [
      "Operations",
      "The existing administration panel manages the site, Telegram orders and customer conversations.",
      "One backend · One administration",
    ],
  ],
  ru: [
    [
      "Интерфейс",
      "Доступные страницы и формы показывают опубликованный контент и принимают заявки.",
      "React · TypeScript",
    ],
    [
      "API",
      "Публичный API возвращает опубликованные снимки. Изменения доступны только по защищённой сессии администратора.",
      "NestJS · Валидация · Роли",
    ],
    [
      "Данные",
      "Проекты, черновики, версии и заявки хранятся вместе с существующими бизнес-данными.",
      "PostgreSQL · Prisma",
    ],
    [
      "Управление",
      "Единая панель управляет сайтом, Telegram-заказами и общением с клиентами.",
      "Один backend · Одна панель",
    ],
  ],
};
export default function Architecture({
  locale = "en",
}: {
  locale?: "en" | "ru";
}) {
  const [selected, setSelected] = useState(0);
  const nodes = layers[locale];
  return (
    <div className="architecture">
      <div
        className="architecture-flow"
        aria-label={locale === "ru" ? "Уровни платформы" : "Platform layers"}
      >
        {nodes.map((node, i) => (
          <button
            key={node[0]}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span className="node-symbol" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path
                  d={
                    i === 0
                      ? "M7 9h34v25H7zM18 41h12M24 34v7M7 28h34"
                      : i === 1
                        ? "m18 13-11 11 11 11m12-22 11 11-11 11M27 8l-6 32"
                        : i === 2
                          ? "M9 11c0-8 30-8 30 0s-30 8-30 0m0 0v25c0 8 30 8 30 0V11M9 23c0 8 30 8 30 0"
                          : "M24 8v14M8 38V25h32v13M24 25v13"
                  }
                />
              </svg>
            </span>
            {node[0]}
          </button>
        ))}
      </div>
      <div className="architecture-detail" aria-live="polite">
        <h4>{nodes[selected][0]}</h4>
        <p>{nodes[selected][1]}</p>
        <code>{nodes[selected][2]}</code>
      </div>
    </div>
  );
}
