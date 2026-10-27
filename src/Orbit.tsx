import { useEffect, useRef, useState } from "react";

export default function Orbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);
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
      lastTime = 0,
      lastDrawTime = 0;
    let inView = true;
    const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
    // Cache unit geometry once; each frame only rotates and scales it.
    const rings = Array.from({ length: 38 }, (_, ring) => {
      const latitude = (ring / 37) * Math.PI;
      const points = new Float32Array(121 * 3);
      for (let point = 0; point <= 120; point++) {
        const angle = (point / 120) * Math.PI * 2;
        points[point * 3] = Math.cos(angle) * Math.sin(latitude);
        points[point * 3 + 1] = Math.sin(angle) * Math.sin(latitude);
        points[point * 3 + 2] = Math.cos(latitude);
      }
      return points;
    });
    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const radius = Math.min(width * 0.36, height * 0.36);
      context.strokeStyle = "#8eb5a244";
      context.lineWidth = 0.6;
      for (let line = 0; line < 7; line++) {
        const position = (line + 1) / 8;
        context.beginPath();
        context.moveTo(width * position, height * 0.1);
        context.lineTo(width * position, height * 0.9);
        context.moveTo(width * 0.1, height * position);
        context.lineTo(width * 0.9, height * position);
        context.stroke();
      }
      context.strokeStyle = "#b4ddad";
      context.lineWidth = 0.75;
      const tilt = 0.48 + pointer.currentX * 0.3;
      const twist = phase + pointer.currentY * 0.3;
      const cosTwist = Math.cos(twist),
        sinTwist = Math.sin(twist);
      const cosTilt = Math.cos(tilt),
        sinTilt = Math.sin(tilt);
      context.beginPath();
      for (const points of rings) {
        for (let point = 0; point <= 120; point++) {
          const x = points[point * 3] * radius,
            y = points[point * 3 + 1] * radius;
          const depth = points[point * 3 + 2] * radius;
          const rotatedX = x * cosTwist - depth * sinTwist;
          const rotatedZ = x * sinTwist + depth * cosTwist;
          const rotatedY = y * cosTilt - rotatedZ * sinTilt;
          if (point === 0)
            context.moveTo(width / 2 + rotatedX, height / 2 + rotatedY);
          else context.lineTo(width / 2 + rotatedX, height / 2 + rotatedY);
        }
      }
      context.stroke();
    }
    function tick(time: number) {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;
      phase += elapsed * 0.00009;
      pointer.currentX += (pointer.x - pointer.currentX) * 0.035;
      pointer.currentY += (pointer.y - pointer.currentY) * 0.035;
      if (time - lastDrawTime >= 1000 / 30) {
        draw();
        lastDrawTime = time;
      }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      lastDrawTime = 0;
      draw();
      if (!pausedRef.current && !motion.matches && !document.hidden && inView)
        frame = requestAnimationFrame(tick);
    }
    syncRef.current = sync;
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
      syncRef.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div className="orbit">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="orbit-caption">
        <span>Canvas study / pointer responsive</span>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Play" : "Pause"}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {paused ? <path d="m5 3 7 5-7 5Z" /> : <path d="M5 3v10M11 3v10" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
