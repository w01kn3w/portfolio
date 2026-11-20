import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Orbit from "./Orbit";
import { ContactLinks } from "./ContactLinks";
import { Logo } from "./Logo";
import { fallbackDocument } from "./portfolio-data";
import {
  adminOrigin,
  apiBase,
  clearPreviewMedia,
  setPreviewMedia,
  loadPublished,
  localize,
  mediaUrl,
  safeUrl,
  validDocument,
} from "./portfolio-api";
import type {
  PortfolioContent,
  PortfolioDocument,
  PortfolioPublicEntry,
} from "./portfolio-types";
const Architecture = lazy(() => import("./Architecture"));
const technologyAliases: Record<string, string> = {
  nodejs: "nodedotjs",
  nextjs: "nextdotjs",
};
const techIcon = (value?: string) => technologyAliases[value || ""] || value;
function documentLanguage(
  document: PortfolioDocument,
  selected: string | null,
): "en" | "ru" {
  const settings = document.entries.find(
    (entry) => entry.kind === "DESIGN" && entry.content.active !== false,
  )?.content;
  const available = settings?.availableLanguages?.filter(
    (language): language is "en" | "ru" =>
      language === "en" || language === "ru",
  ) || ["en", "ru"];
  const preferred = selected || settings?.defaultLanguage || "en";
  return (available.find((language) => language === preferred) ||
    available[0] ||
    "en") as "en" | "ru";
}
const words = {
  en: {
    services: "Services",
    projects: "Projects",
    about: "About",
    contact: "Contact",
    quote: "Get a quote",
    menu: "Menu",
    close: "Close menu",
    all: "All projects",
    details: "Explore project",
    source: "View source",
    live: "Visit website",
    back: "Back to projects",
    challenge: "The challenge",
    solution: "The solution",
    results: "Verified results",
    stack: "The right tools for the task.",
    stackDesc:
      "A connected toolkit for interfaces, systems and infrastructure.",
    servicesTitle: "Built around your next step.",
    servicesDesc:
      "From a first website to the systems behind your business. Choose the work you need, and we will define the right scope together.",
    projectsTitle: "Work you can explore.",
    projectsDesc:
      "Explore the implementation, technical choices and source behind the work.",
    name: "Your name",
    email: "Email address",
    message: "What would you like to build?",
    send: "Send inquiry",
    sending: "Sending…",
    sent: "Your inquiry has been saved. Thank you for sharing your project.",
    failure:
      "The server did not confirm your inquiry. Retry with the same form or send an email instead.",
    emailFallback: "Send an email instead",
    required: "All fields are required.",
    empty: "Published projects will appear here.",
    inquiryService: "Service of interest",
    anyService: "Let’s discuss it",
    draft: "Private draft preview. Changes are not published.",
    previewWaiting:
      "Waiting for the administration panel to send a preview. Open this page using Preview in Portfolio CMS.",
    fallback:
      "You’re viewing a saved copy of this site. You can still reach me by email or WhatsApp.",
    privacy: "Privacy",
    terms: "Terms",
    top: "Back to top",
    notFound: "This page could not be found.",
    home: "Return home",
    from: "From",
    days: "days",
    quotePrice: "Scoped to your project",
    contactHint: "Your details are used to respond to your inquiry.",
    architecture: "One connected platform.",
    footer: "Web development, backend engineering and automation.",
    techNote: "Technology marks belong to their respective owners.",
    newProject: "Start a project",
    copy: "Copy email",
    copied: "Email copied",
    copyFailed: "Copy unavailable. Use the email link.",
    unknown: "Project unavailable",
    unknownDesc: "This project has not been published or no longer exists.",
  },
  ru: {
    services: "Услуги",
    projects: "Проекты",
    about: "О нас",
    contact: "Контакты",
    quote: "Обсудить задачу",
    menu: "Меню",
    close: "Закрыть меню",
    all: "Все проекты",
    details: "Смотреть проект",
    source: "Исходный код",
    live: "Открыть сайт",
    back: "К проектам",
    challenge: "Задача",
    solution: "Решение",
    results: "Подтверждённые результаты",
    stack: "Инструменты под вашу задачу.",
    stackDesc:
      "Единый набор технологий для интерфейсов, систем и инфраструктуры.",
    servicesTitle: "Разработка для вашего следующего шага.",
    servicesDesc:
      "От первого сайта до внутренних систем бизнеса. Выберите направление, а мы вместе определим подходящий объём работы.",
    projectsTitle: "Работа, которую можно изучить.",
    projectsDesc:
      "Реальная реализация. Открытые исходники. Без вымышленных историй успеха.",
    name: "Ваше имя",
    email: "Электронная почта",
    message: "Что вы хотите создать?",
    send: "Отправить заявку",
    sending: "Отправляем…",
    sent: "Заявка сохранена. Спасибо за рассказ о вашем проекте.",
    failure:
      "Сервер не подтвердил получение заявки. Повторите отправку с той же формой или напишите на почту.",
    emailFallback: "Написать на почту",
    required: "Все поля обязательны.",
    empty: "Опубликованные проекты появятся здесь.",
    inquiryService: "Интересующая услуга",
    anyService: "Давайте обсудим",
    draft: "Закрытый просмотр черновика. Изменения не опубликованы.",
    previewWaiting:
      "Ожидаем данные из панели управления. Откройте эту страницу кнопкой «Предпросмотр» в Portfolio CMS.",
    fallback:
      "Вы просматриваете сохранённую версию сайта. Вы можете связаться со мной по почте или через WhatsApp.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    top: "Наверх",
    notFound: "Эта страница не найдена.",
    home: "На главную",
    from: "От",
    days: "дней",
    quotePrice: "Стоимость после обсуждения",
    contactHint: "Ваши данные используются для ответа на заявку.",
    architecture: "Одна связанная платформа.",
    footer: "Веб-разработка, серверные системы и автоматизация.",
    techNote: "Товарные знаки технологий принадлежат их владельцам.",
    newProject: "Начать проект",
    copy: "Скопировать почту",
    copied: "Почта скопирована",
    copyFailed: "Не удалось скопировать. Воспользуйтесь ссылкой на почту.",
    unknown: "Проект недоступен",
    unknownDesc: "Проект ещё не опубликован или больше не существует.",
  },
};
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} />
    </svg>
  );
}
function ServiceIcon({ name }: { name?: string }) {
  const paths: Record<string, string> = {
    window: "M3 5h18v14H3zM3 9h18M7 7h.1M10 7h.1",
    server: "M4 3h16v7H4zM4 14h16v7H4zM7 6.5h.1M7 17.5h.1M11 6.5h6M11 17.5h6",
    workflow: "M9 4h6v6H9zM2 16h6v6H2zM16 16h6v6h-6zM12 10v3M5 16v-3h14v3",
    layers: "m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5",
    code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16",
  };
  return (
    <svg
      className="service-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <path d={paths[name || ""] || paths.code} />
    </svg>
  );
}
function Image({
  id,
  alt,
  className = "",
}: {
  id?: string;
  alt: string;
  className?: string;
}) {
  return id ? (
    <img
      className={className}
      src={mediaUrl(id)}
      crossOrigin="anonymous"
      alt={alt}
      loading="lazy"
      decoding="async"
      width="1200"
      height="800"
    />
  ) : null;
}
function Brand({ logoMediaId }: { logoMediaId?: string }) {
  return logoMediaId ? (
    <a className="wordmark" href="/#top" aria-label="Atajan Labs home">
      <img
        className="logo-mark"
        src={mediaUrl(logoMediaId)}
        crossOrigin="anonymous"
        alt=""
        width="44"
        height="44"
      />
      <span>
        Atajan <strong>Labs</strong>
      </span>
    </a>
  ) : (
    <Logo as="a" />
  );
}
function ProjectGraphic({ platform = false }: { platform?: boolean }) {
  if (platform)
    return (
      <div className="project-graphic platform-graphic" aria-hidden="true">
        <div className="platform-flow">
          <div className="platform-clients">
            <span>Telegram bot</span>
            <span>Admin panel</span>
          </div>
          <div className="platform-connector" />
          <strong>Shared API</strong>
          <div className="platform-connector" />
          <span>PostgreSQL</span>
        </div>
      </div>
    );
  return (
    <div className="project-graphic" aria-hidden="true">
      <div className="graphic-window">
        <div className="graphic-toolbar">
          <i />
          <i />
          <i />
          <span>atajan.org</span>
        </div>
        <div className="graphic-page">
          <span>Atajan Labs</span>
          <div className="graphic-headline">
            Ideas into
            <br />
            working software.
          </div>
          <div className="graphic-orbit">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ transform: `rotate(${i * 15}deg)` }} />
            ))}
          </div>
          <div className="graphic-rule" />
          <div className="graphic-columns">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}
function Contact({
  content,
  services,
  locale,
}: {
  content: PortfolioContent;
  services: PortfolioPublicEntry[];
  locale: "en" | "ru";
}) {
  const t = words[locale];
  const [state, setState] = useState<
    "idle" | "sending" | "success" | "error" | "draft"
  >("idle");
  const [copy, setCopy] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const submission = useRef(crypto.randomUUID());
  const submittedPayload = useRef<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const payload = {
      name: String(data.name).trim(),
      email: String(data.email).trim(),
      message: String(data.message).trim(),
      website: String(data.website || ""),
      locale,
      ...(data.serviceId ? { serviceId: data.serviceId } : {}),
    };
    if (payload.website) return;
    if (payload.name.length < 2 || payload.message.length < 10) {
      const field = form.elements.namedItem(
        payload.name.length < 2 ? "name" : "message",
      ) as HTMLInputElement | HTMLTextAreaElement;
      field.setCustomValidity(
        locale === "ru"
          ? "Добавьте больше информации, не считая пробелов."
          : "Please add more detail, excluding spaces.",
      );
      field.reportValidity();
      return;
    }
    const emailDraft = content.email
      ? `mailto:${content.email}?subject=${encodeURIComponent("Project inquiry from " + payload.name)}&body=${encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`)}`
      : "";
    setDraftUrl(emailDraft);
    if (import.meta.env.VITE_CONTACT_MODE === "email" && emailDraft) {
      setState("draft");
      return;
    }
    const fingerprint = JSON.stringify(payload);
    if (submittedPayload.current !== fingerprint)
      submission.current = crypto.randomUUID();
    submittedPayload.current = fingerprint;
    setState("sending");
    try {
      const response = await fetch(`${apiBase}/portfolio/inquiries`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: submission.current }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error("Inquiry not confirmed");
      const result = await response.json();
      if (result?.success !== true) throw new Error("Inquiry not confirmed");
      setState("success");
      form.reset();
      submission.current = crypto.randomUUID();
      submittedPayload.current = null;
    } catch {
      setState("error");
    }
  }
  return (
    <section
      className="section-width contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-copy">
        <h2 id="contact-title">{localize(content.title, locale)}</h2>
        <p>{localize(content.description, locale)}</p>
        <ContactLinks content={content} locale={locale} />
        {content.email && (
          <button
            className="text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(content.email!);
                setCopy(t.copied);
              } catch {
                setCopy(t.copyFailed);
              }
            }}
          >
            {t.copy}
          </button>
        )}
        <p className="small-copy" role="status">
          {copy}
        </p>
      </div>
      <form
        className="inquiry-form"
        onSubmit={submit}
        aria-busy={state === "sending"}
        onInput={(event) => {
          const field = event.target;
          if (
            field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement
          )
            field.setCustomValidity("");
        }}
      >
        <p className="small-copy">{t.required}</p>
        <label htmlFor="inquiry-name">
          {t.name}
          <input
            id="inquiry-name"
            name="name"
            autoComplete="name"
            readOnly={state === "sending"}
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label htmlFor="inquiry-email">
          {t.email}
          <input
            id="inquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            readOnly={state === "sending"}
            required
            maxLength={254}
          />
        </label>
        {services.some((s) => s.content.catalogServiceId) && (
          <label htmlFor="inquiry-service">
            {t.inquiryService}
            <select id="inquiry-service" name="serviceId">
              <option value="">{t.anyService}</option>
              {services
                .filter((s) => s.content.catalogServiceId)
                .map((s) => (
                  <option value={s.content.catalogServiceId} key={s.id}>
                    {localize(s.content.title, locale)}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label htmlFor="inquiry-message">
          {t.message}
          <textarea
            id="inquiry-message"
            name="message"
            readOnly={state === "sending"}
            required
            minLength={10}
            maxLength={6000}
            rows={4}
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="form-bottom">
          <p className="small-copy">
            {t.contactHint} <a href="/legal/privacy/">{t.privacy}</a>
          </p>
          <button
            className="button primary"
            type="submit"
            disabled={state === "sending"}
          >
            {state === "sending"
              ? t.sending
              : import.meta.env.VITE_CONTACT_MODE === "email"
                ? locale === "ru"
                  ? "Подготовить письмо"
                  : "Prepare email"
                : t.send}
            <Arrow />
          </button>
        </div>
        <p
          className={
            state === "error" ? "form-feedback error" : "form-feedback"
          }
          role="status"
          aria-live="polite"
        >
          {state === "success"
            ? t.sent
            : state === "error"
              ? t.failure
              : state === "draft"
                ? locale === "ru"
                  ? "Черновик готов. Откройте почтовое приложение и отправьте письмо. Сообщение ещё не отправлено."
                  : "Your draft is ready. Open your email app to review and send it. No message has been sent yet."
                : ""}
        </p>
        {content.email && (
          <a className="text-link" href={draftUrl || `mailto:${content.email}`}>
            {draftUrl
              ? locale === "ru"
                ? "Открыть черновик письма"
                : "Open email draft"
              : t.emailFallback}
            <Arrow diagonal />
          </a>
        )}
      </form>
    </section>
  );
}
function ProjectDetail({
  entry,
  entries,
  locale,
}: {
  entry: PortfolioPublicEntry;
  entries: PortfolioPublicEntry[];
  locale: "en" | "ru";
}) {
  const c = entry.content,
    t = words[locale];
  return (
    <main id="main" className="detail-page section-width" tabIndex={-1}>
      <a className="text-link" href="/#projects">
        {t.back}
        <Arrow />
      </a>
      <h1>{localize(c.title, locale)}</h1>
      <p className="detail-intro">{localize(c.description, locale)}</p>
      <p className="project-context">
        {locale === "ru" ? "Собственный проект" : "Independent project"}
        {c.liveUrl
          ? locale === "ru"
            ? " · Доступна рабочая версия"
            : " · Live website available"
          : ""}
      </p>
      {c.coverMediaId ? (
        <Image
          id={c.coverMediaId}
          alt={localize(c.title, locale)}
          className="detail-cover"
        />
      ) : (
        <ProjectGraphic platform={entry.slug === "atajan-services-platform"} />
      )}
      {!c.coverMediaId && (
        <p className="visual-caption">
          {locale === "ru"
            ? "Авторская иллюстрация реализации, не скриншот продукта."
            : "Original implementation illustration, not a product screenshot."}
        </p>
      )}
      <div className="detail-layout">
        <aside>
          <div className="tag-list">
            {c.technologySlugs?.map((slug) => (
              <span key={slug}>
                {localize(
                  entries.find(
                    (x) => x.kind === "TECHNOLOGY" && x.slug === slug,
                  )?.content.title,
                  locale,
                ) || slug}
              </span>
            ))}
          </div>
          {c.completionDate && (
            <p>
              {new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "long",
              }).format(new Date(c.completionDate))}
            </p>
          )}
          <div className="detail-links">
            {c.liveUrl && (
              <a
                className="text-link"
                href={safeUrl(c.liveUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.live}
                <Arrow diagonal />
              </a>
            )}
            {c.githubUrl && (
              <a
                className="text-link"
                href={safeUrl(c.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.source}
                <Arrow diagonal />
              </a>
            )}
          </div>
        </aside>
        <div className="detail-body">
          <p>{localize(c.body, locale)}</p>
          {[
            [t.challenge, c.challenge],
            [t.solution, c.solution],
            [t.results, c.results],
          ].map(([label, value]) =>
            value && typeof value !== "string" ? (
              <section key={String(label)}>
                <h2>{String(label)}</h2>
                <p>{localize(value, locale)}</p>
                {label === t.results && c.resultsEvidenceUrl && (
                  <a href={safeUrl(c.resultsEvidenceUrl)}>
                    {t.source}
                    <Arrow diagonal />
                  </a>
                )}
              </section>
            ) : null,
          )}
        </div>
      </div>
      {c.galleryMediaIds?.map((id, index) => (
        <Image
          key={id}
          id={id}
          alt={`${localize(c.title, locale)} ${index + 1}`}
          className="detail-cover"
        />
      ))}
      <a className="button primary" href="/#contact">
        {t.newProject}
        <Arrow />
      </a>
    </main>
  );
}
export default function App() {
  const [doc, setDoc] = useState<PortfolioDocument>(() => {
    try {
      const snapshot: unknown = JSON.parse(
        document.getElementById("portfolio-snapshot")?.textContent || "null",
      );
      return validDocument(snapshot) ? snapshot : fallbackDocument;
    } catch {
      return fallbackDocument;
    }
  });
  const [source, setSource] = useState<
    "loading" | "live" | "fallback" | "preview"
  >("loading");
  const [locale, setLocale] = useState<"en" | "ru">(() =>
    localStorage.getItem("atajan-language") === "ru" ? "ru" : "en",
  );
  const languageWasChosen = useRef(!!localStorage.getItem("atajan-language"));
  const [hash, setHash] = useState(location.hash);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu(false);
      document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);
  const [category, setCategory] = useState("all");
  const preview = new URLSearchParams(location.search).has("preview");
  const t = words[locale];
  useEffect(() => {
    if (preview) {
      const listener = (event: MessageEvent) => {
        if (
          event.origin !== adminOrigin ||
          event.source !== window.opener ||
          event.data?.type !== "atajan:portfolio-preview" ||
          !validDocument(event.data.document)
        )
          return;
        setPreviewMedia(event.data.media);
        setLocale(
          documentLanguage(
            event.data.document,
            languageWasChosen.current
              ? localStorage.getItem("atajan-language")
              : null,
          ),
        );
        setDoc(event.data.document);
        setSource("preview");
      };
      window.addEventListener("message", listener);
      window.opener?.postMessage(
        { type: "atajan:portfolio-preview-ready" },
        adminOrigin,
      );
      return () => {
        window.removeEventListener("message", listener);
        clearPreviewMedia();
      };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    void loadPublished(controller.signal)
      .then((value) => {
        setDoc(value);
        setSource("live");
        setLocale(
          documentLanguage(
            value,
            languageWasChosen.current
              ? localStorage.getItem("atajan-language")
              : null,
          ),
        );
      })
      .catch(() => setSource("fallback"));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [preview]);
  useEffect(() => {
    const listener = () => {
      setHash(location.hash);
      setMenu(false);
      if (location.hash.startsWith("#/")) window.scrollTo(0, 0);
      else
        requestAnimationFrame(() =>
          document.getElementById(location.hash.slice(1))?.scrollIntoView(),
        );
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const entries = doc.entries
    .filter((e) => e.content.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const first = (kind: string, slug?: string) =>
    entries.find((e) => e.kind === kind && (!slug || e.slug === slug))?.content;
  const home = first("HOMEPAGE", "home") || first("HOMEPAGE");
  const design = first("DESIGN");
  const availableLanguages = design?.availableLanguages?.filter(
    (language) => language === "en" || language === "ru",
  ) || ["en", "ru"];
  const seo = first("SEO");
  const routeProjectSlug =
    location.pathname.match(/^\/projects\/([a-z0-9-]+)\/?$/)?.[1] ||
    (hash.startsWith("#/projects/") ? hash.slice(11) : null);
  const project = routeProjectSlug
    ? entries.find((e) => e.kind === "PROJECT" && e.slug === routeProjectSlug)
    : undefined;
  const legalSlug =
    location.pathname.match(/^\/legal\/([a-z0-9-]+)\/?$/)?.[1] ||
    (hash.startsWith("#/legal/") ? hash.slice(8) : null);
  const legal = legalSlug
    ? entries.find((e) => e.kind === "LEGAL" && e.slug === legalSlug)
    : undefined;
  useEffect(() => {
    const data: PortfolioContent | undefined =
      project?.content ||
      legal?.content ||
      (legalSlug
        ? {
            title: {
              en: legalSlug === "privacy" ? words.en.privacy : words.en.terms,
              ru: legalSlug === "privacy" ? words.ru.privacy : words.ru.terms,
            },
            description: {
              en:
                legalSlug === "privacy"
                  ? "How Atajan Labs uses your project inquiry information."
                  : "Projects begin after scope, pricing and delivery terms are agreed separately.",
            },
          }
        : undefined);
    document.documentElement.setAttribute("lang", locale);
    const canonical = project
      ? "https://atajan.org/projects/" + project.slug + "/"
      : legalSlug
        ? `https://atajan.org/legal/${legalSlug}/`
        : "https://atajan.org/";
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", canonical);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", canonical);
    localStorage.setItem("atajan-language", locale);
    document
      .querySelector("title")
      ?.replaceChildren(
        document.createTextNode(
          localize(
            data?.seoTitle || data?.title || seo?.seoTitle || seo?.title,
            locale,
          ) || "Atajan Labs",
        ),
      );
    const description = localize(
      data?.seoDescription ||
        data?.description ||
        seo?.seoDescription ||
        seo?.description,
      locale,
    );
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:image"]')
      ?.setAttribute(
        "content",
        data?.ogMediaId || seo?.ogMediaId || design?.ogMediaId
          ? mediaUrl((data?.ogMediaId || seo?.ogMediaId || design?.ogMediaId)!)
          : "https://atajan.org/social-card.png",
      );
    for (const [name, value] of Object.entries({
      "twitter:title": document.title,
      "twitter:description": description,
      "twitter:image":
        document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") || "https://atajan.org/social-card.png",
    }))
      document
        .querySelector(`meta[name="${name}"]`)
        ?.setAttribute("content", value);
    document
      .querySelector('link[rel="icon"]')
      ?.setAttribute(
        "href",
        design?.faviconMediaId
          ? mediaUrl(design.faviconMediaId)
          : `${import.meta.env.BASE_URL}favicon.svg`,
      );
    if (design?.primaryColor && /^#[\da-f]{6}$/i.test(design.primaryColor))
      document.documentElement.style.setProperty(
        "--accent",
        design.primaryColor,
      );
    if (
      design?.backgroundColor &&
      /^#[\da-f]{6}$/i.test(design.backgroundColor)
    )
      document.documentElement.style.setProperty(
        "--bg",
        design.backgroundColor,
      );
    if (design?.fontFamily)
      document.documentElement.style.setProperty(
        "--font",
        design.fontFamily === "Manrope"
          ? "Manrope, sans-serif"
          : design.fontFamily === "Inter"
            ? "Inter, sans-serif"
            : "system-ui, sans-serif",
      );
  }, [locale, seo, design, project, legal, legalSlug]);
  const hero = first("HERO"),
    services = entries.filter((e) => e.kind === "SERVICE"),
    projects = entries.filter((e) => e.kind === "PROJECT"),
    categories = entries.filter((e) => e.kind === "PROJECT_CATEGORY"),
    contact = first("CONTACT"),
    about = first("ABOUT"),
    process = first("PROCESS"),
    cta = first("HOMEPAGE", "final-cta");
  const processItems =
    process?.items ||
    entries
      .filter((e) => e.kind === "PROCESS")
      .map((e) => ({
        title: e.content.title,
        description: e.content.description,
      }));
  const navigation = entries
    .filter((e) => e.kind === "NAVIGATION")
    .flatMap(
      (e) =>
        e.content.items?.map((item, index) => ({
          id: `${e.id}-${index}`,
          title: item.title,
          url: item.url,
        })) || [
          {
            id: e.id,
            title: e.content.title,
            url: e.content.url || e.content.buttonUrl,
          },
        ],
    );
  const serviceIntro = first("HOMEPAGE", "services");
  const projectIntro = first("HOMEPAGE", "projects");
  const technologyIntro = first("HOMEPAGE", "technologies");
  const footerContent = first("HOMEPAGE", "footer");
  const headerContent = first("HOMEPAGE", "header");
  const defaultNavigation = [
    ["services", t.services],
    ["projects", t.projects],
    ["about", t.about],
    ["contact", t.contact],
  ].filter(
    ([id]) =>
      !home?.disabledSections?.includes(id || "") &&
      (id !== "services" || services.length > 0) &&
      (id !== "about" || !!about) &&
      (id !== "contact" || !!contact),
  );
  const sectionHeader = (title: string, description?: string) => (
    <div className="section-heading">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
  const sections: Record<string, ReactNode> = {
    hero: hero && (
      <section
        className="hero section-width"
        id="hero"
        aria-labelledby="hero-title"
      >
        <div className="hero-copy">
          <h1 id="hero-title">{localize(hero.title, locale)}</h1>
          <p className="hero-introduction">
            {locale === "ru"
              ? "Я Атаджан, независимый full-stack разработчик."
              : "I’m Atajan, an independent full-stack developer."}
          </p>
          <p>{localize(hero.description, locale)}</p>
          <div className="hero-actions">
            <a
              className="button primary"
              href={safeUrl(hero.buttonUrl, "#projects")}
            >
              {localize(hero.buttonLabel, locale) || t.projects}
              <Arrow />
            </a>
            <a
              className="button secondary"
              href={safeUrl(hero.secondaryButtonUrl)}
            >
              {localize(hero.secondaryButtonLabel, locale) || t.newProject}
              <Arrow diagonal />
            </a>
          </div>
        </div>
        <div className="hero-art">
          {hero.imageMediaId ? (
            <Image id={hero.imageMediaId} alt={localize(hero.title, locale)} />
          ) : (
            <Orbit locale={locale} />
          )}
          <div className="art-note">
            <span>Atajan Labs</span>
            <span>Web · Systems · Automation</span>
          </div>
        </div>
      </section>
    ),
    services: services.length > 0 && (
      <section
        className="section-width section-block"
        id="services"
        aria-labelledby="services-title"
      >
        <div id="services-title">
          {sectionHeader(
            localize(serviceIntro?.title, locale) || t.servicesTitle,
            localize(serviceIntro?.description, locale) || t.servicesDesc,
          )}
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <article className="service" key={s.id}>
              <ServiceIcon name={s.content.icon} />
              <div>
                <h3>{localize(s.content.title, locale)}</h3>
                <p>{localize(s.content.description, locale)}</p>
                <Image
                  id={s.content.imageMediaId}
                  alt={localize(s.content.title, locale)}
                  className="service-image"
                />
                <ul className="service-items">
                  {s.content.items?.map((item, i) => (
                    <li key={i}>{localize(item.title, locale)}</li>
                  ))}
                </ul>
                <div className="service-bottom">
                  <span>
                    {s.content.startingPriceMinor !== undefined
                      ? `${t.from} ${new Intl.NumberFormat(locale, { style: "currency", currency: s.content.priceCurrency || "USD", ...(s.content.priceCurrency === "XTR" ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}) }).format(s.content.startingPriceMinor / (s.content.priceCurrency === "XTR" ? 1 : 100))}`
                      : t.quotePrice}
                    {s.content.estimatedDays
                      ? ` · ${s.content.estimatedDays} ${t.days}`
                      : ""}
                  </span>
                  <a
                    href={safeUrl(s.content.buttonUrl)}
                    aria-label={`${localize(s.content.buttonLabel, locale) || t.newProject}: ${localize(s.content.title, locale)}`}
                  >
                    <Arrow diagonal />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
    projects: (
      <section
        className="section-width section-block"
        id="projects"
        aria-labelledby="projects-title"
      >
        <div id="projects-title">
          {sectionHeader(
            localize(projectIntro?.title, locale) || t.projectsTitle,
            localize(projectIntro?.description, locale) || t.projectsDesc,
          )}
        </div>
        <div className="project-filters" aria-label={t.projects}>
          <button
            className={category === "all" ? "selected" : ""}
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={category === c.slug ? "selected" : ""}
              aria-pressed={category === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              {localize(c.content.title, locale)}
            </button>
          ))}
        </div>
        <div className="project-grid">
          {projects
            .filter(
              (p) => category === "all" || p.content.categorySlug === category,
            )
            .map((p) => (
              <article className="project" key={p.id}>
                <a
                  className="project-cover"
                  href={`/projects/${encodeURIComponent(p.slug)}/`}
                  aria-label={`${t.details}: ${localize(p.content.title, locale)}`}
                >
                  {p.content.coverMediaId ? (
                    <Image
                      id={p.content.coverMediaId}
                      alt={localize(p.content.title, locale)}
                    />
                  ) : (
                    <ProjectGraphic
                      platform={p.slug === "atajan-services-platform"}
                    />
                  )}
                  <span className="project-open">
                    <Arrow diagonal />
                  </span>
                </a>
                <div className="project-description">
                  <div>
                    <h3>
                      <a href={`/projects/${encodeURIComponent(p.slug)}/`}>
                        {localize(p.content.title, locale)}
                      </a>
                    </h3>
                    <p>{localize(p.content.description, locale)}</p>
                    <div className="tag-list">
                      {p.content.technologySlugs?.map((slug) => (
                        <span key={slug}>
                          {localize(
                            entries.find(
                              (x) => x.kind === "TECHNOLOGY" && x.slug === slug,
                            )?.content.title,
                            locale,
                          ) || slug}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    className="text-link"
                    href={`/projects/${encodeURIComponent(p.slug)}/`}
                  >
                    {t.details}
                    <Arrow diagonal />
                  </a>
                </div>
              </article>
            ))}
        </div>
        {projects.length === 0 && <p className="empty-state">{t.empty}</p>}
      </section>
    ),
    technologies: entries.some((e) => e.kind === "TECHNOLOGY") && (
      <section className="technology-section section-width" id="technologies">
        {sectionHeader(
          localize(technologyIntro?.title, locale) || t.stack,
          localize(technologyIntro?.description, locale) || t.stackDesc,
        )}
        <div className="technology-list">
          {entries
            .filter((e) => e.kind === "TECHNOLOGY")
            .map((e) => (
              <div key={e.id}>
                {[
                  "typescript",
                  "javascript",
                  "nodedotjs",
                  "react",
                  "nextdotjs",
                  "nestjs",
                  "postgresql",
                  "redis",
                  "docker",
                  "linux",
                  "git",
                ].includes(techIcon(e.content.icon) || "") && (
                  <img
                    src={`${import.meta.env.BASE_URL}technology/${techIcon(e.content.icon)}.svg`}
                    alt=""
                    width="30"
                    height="30"
                    loading="lazy"
                  />
                )}
                <span>{localize(e.content.title, locale)}</span>
              </div>
            ))}
        </div>
        <p className="small-copy">{t.techNote}</p>
      </section>
    ),
    process: process && (
      <section
        className="section-width section-block process-section"
        id="process"
      >
        {sectionHeader(
          localize(first("HOMEPAGE", "process")?.title, locale) ||
            (process.items
              ? localize(process.title, locale)
              : locale === "ru"
                ? "Понятный процесс на каждом этапе."
                : "A clear process at every stage."),
          localize(first("HOMEPAGE", "process")?.description, locale) ||
            (process.items ? localize(process.description, locale) : ""),
        )}
        <ol className="process-list">
          {processItems.map((item, i) => (
            <li key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{localize(item.title, locale)}</h3>
              <p>{localize(item.description, locale)}</p>
            </li>
          ))}
        </ol>
      </section>
    ),
    about: about && (
      <section className="section-width section-block about-section" id="about">
        <div>
          <h2>{localize(about.title, locale)}</h2>
          <p className="about-intro">{localize(about.description, locale)}</p>
          <p>{localize(about.body, locale)}</p>
          <Image id={about.imageMediaId} alt={localize(about.title, locale)} />
        </div>
        <div className="architecture-panel">
          <h3>{t.architecture}</h3>
          <Suspense fallback={<p>React · API · PostgreSQL</p>}>
            <Architecture locale={locale} />
          </Suspense>
        </div>
      </section>
    ),
    contact: contact && (
      <Contact content={contact} services={services} locale={locale} />
    ),
    cta: cta && (
      <section className="final-cta section-width">
        <h2>{localize(cta.title, locale)}</h2>
        <a className="button primary" href={safeUrl(cta.buttonUrl)}>
          {localize(cta.buttonLabel, locale) || t.newProject}
          <Arrow diagonal />
        </a>
      </section>
    ),
  };
  const missingPath =
    location.pathname !== "/" &&
    location.pathname !== import.meta.env.BASE_URL &&
    location.pathname !== "/index.html" &&
    !/^\/(projects|legal)\/[a-z0-9-]+\/?$/.test(location.pathname);
  const unknown =
    (!!routeProjectSlug && !project) ||
    (!!legalSlug && !legal && !["privacy", "terms"].includes(legalSlug)) ||
    (hash.startsWith("#/") && !project && !legalSlug) ||
    missingPath;
  useEffect(() => {
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        "content",
        unknown || preview ? "noindex, nofollow" : "index, follow",
      );
    if (unknown) document.title = `${words[locale].notFound} | Atajan Labs`;
  }, [unknown, preview, locale]);
  return (
    <>
      <a className="skip-link" href="#main">
        {locale === "ru" ? "К содержимому" : "Skip to content"}
      </a>
      <header className="site-header section-width" id="top">
        <Brand logoMediaId={design?.logoMediaId} />
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="primary-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? t.close : t.menu}
          <span aria-hidden="true">{menu ? "−" : "+"}</span>
        </button>
        <nav
          id="primary-navigation"
          onClick={() => setMenu(false)}
          className={menu ? "primary-nav open" : "primary-nav"}
          aria-label={
            locale === "ru" ? "Основная навигация" : "Main navigation"
          }
        >
          {navigation.length
            ? navigation.map((n) => (
                <a key={n.id} href={safeUrl(n.url, "#top")}>
                  {localize(n.title, locale)}
                </a>
              ))
            : defaultNavigation.map(([id, title]) => (
                <a key={id} href={`/#${id}`}>
                  {title}
                </a>
              ))}
        </nav>
        <div className="header-actions">
          <label className="language-control">
            <span className="sr-only">
              {locale === "ru" ? "Язык" : "Language"}
            </span>
            <select
              aria-label={locale === "ru" ? "Язык" : "Language"}
              value={locale}
              onChange={(e) => {
                languageWasChosen.current = true;
                setLocale(e.target.value === "ru" ? "ru" : "en");
              }}
            >
              {(availableLanguages.length ? availableLanguages : ["en"]).map(
                (language) => (
                  <option key={language} value={language}>
                    {language.toUpperCase()}
                  </option>
                ),
              )}
            </select>
          </label>
          <a
            className="button compact secondary"
            href={safeUrl(headerContent?.buttonUrl)}
          >
            {localize(headerContent?.buttonLabel, locale) || t.quote}
            <Arrow diagonal />
          </a>
        </div>
      </header>
      {preview && (
        <div className="preview-notice" role="status">
          {source === "preview" ? t.draft : t.previewWaiting}
        </div>
      )}
      {unknown ? (
        <main id="main" className="not-found section-width">
          <h1>{t.notFound}</h1>
          <a className="button primary" href="/">
            {t.home}
            <Arrow />
          </a>
        </main>
      ) : project ? (
        <ProjectDetail entry={project} entries={entries} locale={locale} />
      ) : legalSlug ? (
        <main id="main" className="legal-page section-width">
          <a className="text-link" href="/#top">
            {t.home}
            <Arrow />
          </a>
          <h1>
            {legal
              ? localize(legal.content.title, locale)
              : legalSlug === "privacy"
                ? t.privacy
                : t.terms}
          </h1>
          {legal ? (
            <>
              <p>{localize(legal.content.description, locale)}</p>
              <p>{localize(legal.content.body, locale)}</p>
            </>
          ) : (
            <p>
              {locale === "en"
                ? legalSlug === "privacy"
                  ? "The inquiry form collects your name, email and project message so Atajan Labs can respond. Confirmed API submissions are stored in the private administration system. Email drafts are sent only through your own mail app. Please do not include passwords, payment details or other secrets. Contact us by email to request access, correction or deletion."
                  : "This website presents development services and project evidence. A project begins only after scope, pricing, delivery and support terms have been agreed separately. This website does not accept payments. No agreement or payment is created by submitting an inquiry."
                : legalSlug === "privacy"
                  ? "Форма собирает имя, электронную почту и описание проекта для ответа Atajan Labs. Подтверждённые сервером заявки хранятся в закрытой панели управления. Черновики писем отправляются только через ваше почтовое приложение. Не указывайте пароли, платёжные реквизиты и другие секреты. Для доступа, исправления или удаления данных напишите нам на почту."
                  : "Сайт представляет услуги разработки и реальные проекты. Работа начинается после отдельного согласования объёма, стоимости, передачи и поддержки. Сайт не принимает платежи. Отправка заявки не создаёт договор или платёж."}
            </p>
          )}
          {contact?.email && (
            <a className="text-link" href={`mailto:${contact.email}`}>
              {locale === "ru" ? "Написать на почту" : "Send an email"}
              <Arrow diagonal />
            </a>
          )}
        </main>
      ) : (
        <main id="main" tabIndex={-1}>
          {entries.length === 0 && (
            <section className="section-width section-block">
              <h1>
                {locale === "ru"
                  ? "Готовим новые публикации."
                  : "New work is being prepared."}
              </h1>
            </section>
          )}
          {(
            home?.sectionOrder || [
              "hero",
              "services",
              "projects",
              "technologies",
              "process",
              "about",
              "contact",
              "cta",
            ]
          )
            .filter(
              (key, index, array) =>
                array.indexOf(key) === index &&
                !home?.disabledSections?.includes(key),
            )
            .map((key) => (
              <div key={key}>{sections[key]}</div>
            ))}
          {entries.filter((e) => e.kind === "TESTIMONIAL").length > 0 && (
            <section className="section-width testimonials">
              {entries
                .filter((e) => e.kind === "TESTIMONIAL")
                .map((e) => (
                  <blockquote key={e.id}>
                    <p>
                      {localize(
                        e.content.body || e.content.description,
                        locale,
                      )}
                    </p>
                    <cite>{localize(e.content.title, locale)}</cite>
                  </blockquote>
                ))}
            </section>
          )}
        </main>
      )}
      <footer className="site-footer section-width">
        <div className="footer-top">
          <div>
            <Brand logoMediaId={design?.logoMediaId} />
            <p>
              {localize(
                footerContent?.description || footerContent?.body,
                locale,
              ) || t.footer}
            </p>
          </div>
          <nav
            aria-label={
              locale === "ru" ? "Навигация в подвале" : "Footer navigation"
            }
          >
            {(
              footerContent?.items ||
              defaultNavigation.map(([id, title]) => ({
                title: { en: title, ru: title },
                url: `/#${id}`,
              }))
            ).map((item, index) => (
              <a key={index} href={safeUrl(item.url)}>
                {localize(item.title, locale)}
              </a>
            ))}
            {services.length > 0 && (
              <details className="footer-services">
                <summary>
                  {locale === "ru" ? "Направления работы" : "Service areas"}
                </summary>
                {services.map((service) => (
                  <a key={service.id} href={safeUrl(service.content.buttonUrl)}>
                    {localize(service.content.title, locale)}
                  </a>
                ))}
              </details>
            )}
          </nav>
          <div className="footer-contact">
            <p>
              {locale === "ru"
                ? "Обсудим ваш проект"
                : "Let’s talk about your project"}
            </p>
            <ContactLinks
              content={contact}
              social={entries.filter((e) => e.kind === "SOCIAL_LINK")}
              locale={locale}
            />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Atajan Labs</span>
          <div>
            <a href="/legal/privacy/">{t.privacy}</a>
            <a href="/legal/terms/">{t.terms}</a>
            <a href="/#top">
              {t.top}
              <Arrow />
            </a>
          </div>
        </div>
        {source === "fallback" && (
          <p className="content-fallback" role="status">
            {t.fallback}
          </p>
        )}
      </footer>
    </>
  );
}
