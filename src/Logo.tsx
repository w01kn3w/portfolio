export function LogoMark() {
  return (
    <img
      className="logo-mark"
      src={`${import.meta.env.BASE_URL}origin-mark.svg`}
      alt=""
      width="44"
      height="44"
    />
  );
}
export function Logo({ as = "span" }: { as?: "span" | "a" }) {
  const content = (
    <>
      <LogoMark />
      <span className="logo-text">
        Atajan <strong>Labs</strong>
      </span>
    </>
  );
  return as === "a" ? (
    <a className="wordmark" href="/#top" aria-label="Atajan Labs home">
      {content}
    </a>
  ) : (
    <span className="wordmark">{content}</span>
  );
}
