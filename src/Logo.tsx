import { useId } from "react";

/** Monogram badge: geometric "A" on a light lime tile with a soft top highlight. */
export function LogoMark() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6ffb8" />
          <stop offset="0.55" stopColor="#c5f16c" />
          <stop offset="1" stopColor="#a8dc4f" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="64" height="64" rx="16" />
        </clipPath>
        <clipPath id={`${id}-base`}>
          <rect width="64" height="47" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill={`url(#${id}-fill)`} />
        <rect width="64" height="64" fill={`url(#${id}-shine)`} />
        <rect className="logo-sheen" x="-40" y="-8" width="18" height="80" fill="#ffffff" opacity="0.35" />
      </g>
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
      <path
        clipPath={`url(#${id}-base)`}
        d="M16.2 51 32 16l15.8 35"
        fill="none"
        stroke="#17200f"
        strokeWidth="6.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path d="M24.5 37h15" stroke="#17200f" strokeWidth="6" />
    </svg>
  );
}

export function Logo({ as = "span" }: { as?: "span" | "a" }) {
  const content = (
    <>
      <LogoMark />
      <span className="logo-text">
        Atajan<span>.</span>
      </span>
    </>
  );
  if (as === "a")
    return (
      <a href="#top" className="wordmark" aria-label="Atajan home">
        {content}
      </a>
    );
  return <span className="wordmark">{content}</span>;
}
