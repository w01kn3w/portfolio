import { useEffect, useRef, useState } from "react";

export default function Orbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0,
      height = 0,
      frame = 0,
      phase = 0.55,
      lastTime = 0;
    let inView = true;
    const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const radius = Math.min(width * 0.36, height * 0.36);
      context.strokeStyle = "#191b18";
      context.lineWidth = 1.05;
      const tilt = 0.48 + pointer.currentX * 0.3;
      const twist = phase + pointer.currentY * 0.3;
      for (let ring = 0; ring < 38; ring++) {
        const latitude = (ring / 37) * Math.PI;
        const ringRadius = Math.sin(latitude) * radius;
        const depth = Math.cos(latitude) * radius;
        context.beginPath();
        for (let point = 0; point <= 120; point++) {
          const angle = (point / 120) * Math.PI * 2;
          const x = Math.cos(angle) * ringRadius,
            y = Math.sin(angle) * ringRadius;
          const rotatedX = x * Math.cos(twist) - depth * Math.sin(twist);
          const rotatedZ = x * Math.sin(twist) + depth * Math.cos(twist);
          const rotatedY = y * Math.cos(tilt) - rotatedZ * Math.sin(tilt);
          if (point === 0)
            context.moveTo(width / 2 + rotatedX, height / 2 + rotatedY);
          else context.lineTo(width / 2 + rotatedX, height / 2 + rotatedY);
        }
        context.stroke();
      }
    }
    function tick(time: number) {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;
      phase += elapsed * 0.00009;
      pointer.currentX += (pointer.x - pointer.currentX) * 0.035;
      pointer.currentY += (pointer.y - pointer.currentY) * 0.035;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      draw();
      if (!paused && !motion.matches && !document.hidden && inView)
        frame = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    const onMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    resize.observe(canvas);
    intersection.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [paused]);
  return (
    <div className="orbit">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="orbit-caption">
        <span>Идея обретает форму</span>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Продолжить" : "Пауза"}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {paused ? <path d="m5 3 7 5-7 5Z" /> : <path d="M5 3v10M11 3v10" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
