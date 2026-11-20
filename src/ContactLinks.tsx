import type { PortfolioContent, PortfolioPublicEntry } from "./portfolio-types";
import { safeUrl } from "./portfolio-api";

export const whatsappUrl =
  "https://wa.me/8613521004012?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.";

// Brand silhouettes use the official Simple Icons geometry (CC0).
const brandPaths = {
  WhatsApp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.892-9.884a9.825 9.825 0 0 1 7.021 2.91 9.825 9.825 0 0 1 2.9 7.017c-.002 5.45-4.437 9.884-9.929 9.884m8.413-18.297A11.815 11.815 0 0 0 12.054 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.142 1.588 5.946L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.688 1.448h.005c6.557 0 11.894-5.335 11.897-11.893a11.82 11.82 0 0 0-3.489-8.413Z",
  GitHub:
    "M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.628-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.595 24 12.297c0-6.627-5.373-12-12-12",
  Telegram:
    "M23.91 3.79 20.3 20.84c-.27 1.2-.98 1.49-1.98.93l-5.5-4.05-2.65 2.55c-.29.29-.54.54-1.1.54l.39-5.6L19.66 5.99c.44-.39-.1-.61-.69-.22L6.36 13.71.93 12.01c-1.18-.37-1.2-1.18.25-1.75L22.4 2.08c.98-.36 1.84.22 1.51 1.71Z",
};
type Channel = "Email" | "WhatsApp" | "GitHub" | "Instagram" | "Telegram";
function ContactIcon({ channel }: { channel: Channel }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {channel === "Email" ? (
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </g>
      ) : channel === "Instagram" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </g>
      ) : (
        <path fill="currentColor" d={brandPaths[channel]} />
      )}
    </svg>
  );
}

export function ContactLinks({
  content,
  social = [],
  locale,
}: {
  content?: PortfolioContent;
  social?: PortfolioPublicEntry[];
  locale: "en" | "ru";
}) {
  const channels = new Map<Channel, string>();
  if (content?.email) channels.set("Email", `mailto:${content.email}`);
  channels.set("WhatsApp", whatsappUrl);
  if (content?.githubProfileUrl)
    channels.set("GitHub", content.githubProfileUrl);
  if (content?.instagramUrl) channels.set("Instagram", content.instagramUrl);
  if (content?.telegramUrl) channels.set("Telegram", content.telegramUrl);
  for (const entry of social) {
    const url = safeUrl(entry.content.url, "");
    if (url.startsWith("mailto:")) channels.set("Email", url);
    else {
      try {
        const host = new URL(url).hostname;
        const channel =
          host === "github.com"
            ? "GitHub"
            : ["instagram.com", "www.instagram.com"].includes(host)
              ? "Instagram"
              : host === "t.me"
                ? "Telegram"
                : null;
        if (channel && !channels.has(channel)) channels.set(channel, url);
      } catch {
        /* Unsupported destinations are not presented as verified channels. */
      }
    }
  }
  return (
    <div
      className="contact-links"
      role="group"
      aria-label={locale === "ru" ? "Способы связи" : "Contact channels"}
    >
      {[...channels].map(([channel, url]) => (
        <a
          key={channel}
          href={safeUrl(url)}
          aria-label={
            locale === "ru"
              ? channel === "Email"
                ? "Написать на почту"
                : `Связаться через ${channel}`
              : channel === "Email"
                ? "Send me an email"
                : `Contact me on ${channel}`
          }
          title={channel}
          {...(channel !== "Email"
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <ContactIcon channel={channel} />
        </a>
      ))}
    </div>
  );
}
