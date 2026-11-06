import { useEffect, useRef } from "react";

type State = "hidden" | "text" | "idle" | "active";

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const system = root.current,
      ringElement = ring.current,
      coreElement = core.current;
    if (!system || !ringElement || !coreElement) return;
    const query = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const html = document.documentElement;
    let frame = 0,
      last = 0,
      x = 0,
      y = 0,
      ringX = 0,
      ringY = 0;
    let state: State = "hidden",
      kind: State = "idle";
    let target: Element | null = null;
    let magnetic: HTMLElement | null = null;
    let magnetBounds: DOMRect | null = null;
    // Land on whole device pixels so the 1px ring and its label never blur.
    const place = (element: HTMLElement, left: number, top: number) => {
      const ratio = devicePixelRatio || 1;
      element.style.transform = `translate3d(${Math.round(left * ratio) / ratio}px,${Math.round(top * ratio) / ratio}px,0)`;
    };
    const setState = (next: State) => {
      if (next === state) return;
      if (state === "hidden" || next === "hidden")
        html.classList.toggle("custom-cursor", next !== "hidden");
      state = next;
      system.dataset.state = next;
    };
    const resetMagnet = () => {
      if (magnetic) magnetic.style.translate = "";
      magnetic = null;
      magnetBounds = null;
    };
    // The ring eases toward the pointer and the loop stops once it settles.
    const tick = (time: number) => {
      const elapsed = last ? Math.min(time - last, 64) : 16;
      last = time;
      const ease = 1 - Math.exp(-elapsed / 38);
      ringX += (x - ringX) * ease;
      ringY += (y - ringY) * ease;
      if (Math.abs(x - ringX) < 0.15 && Math.abs(y - ringY) < 0.15) {
        ringX = x;
        ringY = y;
        frame = 0;
      } else frame = requestAnimationFrame(tick);
      place(ringElement, ringX, ringY);
    };
    const move = (event: PointerEvent) => {
      if (!query.matches || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      place(coreElement, x, y);
      if (event.target !== target) {
        target = event.target instanceof Element ? event.target : null;
        const interactive =
          target?.closest<HTMLElement>("a,button,summary") ?? null;
        kind = target?.closest("input,textarea,select")
          ? "text"
          : interactive
            ? "active"
            : "idle";
        const label = interactive?.dataset.cursor ?? "";
        if (ringElement.textContent !== label) ringElement.textContent = label;
        const next = interactive?.matches("[data-magnetic]")
          ? interactive
          : null;
        if (next !== magnetic) {
          resetMagnet();
          magnetic = next;
        }
      }
      if (state === "hidden") {
        ringX = x;
        ringY = y;
        place(ringElement, x, y);
      }
      setState(kind);
      if (magnetic) {
        magnetBounds ??= magnetic.getBoundingClientRect();
        magnetic.style.translate = `${(x - magnetBounds.left - magnetBounds.width / 2) * 0.08}px ${(y - magnetBounds.top - magnetBounds.height / 2) * 0.12}px`;
      }
      if (!frame && (ringX !== x || ringY !== y)) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const hide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      target = null;
      resetMagnet();
      setState("hidden");
    };
    const scroll = () => {
      magnetBounds = null;
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("scroll", scroll, { passive: true });
    html.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", visibility);
    query.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("scroll", scroll);
      html.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", visibility);
      query.removeEventListener("change", hide);
    };
  }, []);
  return (
    <div className="cursor-system" ref={root} aria-hidden="true">
      <div className="cursor-core" ref={core} />
      <div className="cursor-ring" ref={ring} />
    </div>
  );
}
