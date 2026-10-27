import { useEffect, useRef } from "react";

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let x = -100,
      y = -100,
      currentX = -100,
      currentY = -100;
    let magnetic: HTMLElement | null = null;
    const resetMagnet = () => {
      if (magnetic) magnetic.style.translate = "";
      magnetic = null;
    };
    const move = (event: PointerEvent) => {
      if (!query.matches || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (core.current)
        core.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("a,button,summary,input,textarea")
          : null;
      if (ring.current) {
        ring.current.dataset.active = String(!!target);
        ring.current.dataset.visible = "true";
        ring.current.textContent = target?.dataset.cursor ?? "";
      }
      const next = target?.matches("[data-magnetic]") ? target : null;
      if (next !== magnetic) resetMagnet();
      magnetic = next;
      if (magnetic) {
        const bounds = magnetic.getBoundingClientRect();
        magnetic.style.translate = `${(x - bounds.left - bounds.width / 2) * 0.08}px ${(y - bounds.top - bounds.height / 2) * 0.12}px`;
      }
    };
    const tick = () => {
      currentX += (x - currentX) * 0.18;
      currentY += (y - currentY) * 0.18;
      if (ring.current)
        ring.current.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      resetMagnet();
      if (ring.current) ring.current.dataset.visible = "false";
      if (query.matches && !document.hidden)
        frame = requestAnimationFrame(tick);
    };
    const leave = () => {
      if (ring.current) ring.current.dataset.visible = "false";
      resetMagnet();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    query.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resetMagnet();
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      query.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div className="cursor-system" aria-hidden="true">
      <div className="cursor-core" ref={core} />
      <div className="cursor-ring" ref={ring} />
    </div>
  );
}
