"use client";

import { useCallback, useRef, useState, useEffect } from "react";

function parsePosition(pos: string | null): { x: number; y: number } {
  if (!pos || typeof pos !== "string") return { x: 50, y: 50 };
  const m = pos.trim().match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!m) return { x: 50, y: 50 };
  return { x: Math.min(100, Math.max(0, parseFloat(m[1]))), y: Math.min(100, Math.max(0, parseFloat(m[2]))) };
}

function toPosition(x: number, y: number): string {
  const px = Math.round(Math.min(100, Math.max(0, x)));
  const py = Math.round(Math.min(100, Math.max(0, y)));
  return `${px}% ${py}%`;
}

type ImagePositionEditorProps = {
  imageUrl: string;
  objectPosition: string | null;
  onSave: (objectPosition: string) => void;
  onClose: () => void;
};

/** Call onSave with current position, then onClose. Ensures position is saved when user clicks Done. */
function useSaveOnClose(
  getCurrentPosition: () => string,
  onSave: (objectPosition: string) => void,
  onClose: () => void
) {
  return useCallback(() => {
    onSave(getCurrentPosition());
    onClose();
  }, [getCurrentPosition, onSave, onClose]);
}

export default function ImagePositionEditor({
  imageUrl,
  objectPosition,
  onSave,
  onClose,
}: ImagePositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => parsePosition(objectPosition));
  const positionRef = useRef(position);
  /** Updated on every move so handleUp reads the final position (setState is async). */
  const lastMoveRef = useRef(position);
  const [dragging, setDragging] = useState(false);

  positionRef.current = position;

  const updateFromEvent = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    const next = { x, y };
    lastMoveRef.current = next;
    setPosition(next);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => updateFromEvent(e.clientX, e.clientY);
    const handleUp = () => {
      setDragging(false);
      const { x, y } = lastMoveRef.current;
      onSave(toPosition(x, y));
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, updateFromEvent, onSave]);

  const positionStr = toPosition(position.x, position.y);
  const getCurrentPosition = useCallback(
    () => toPosition(position.x, position.y),
    [position.x, position.y]
  );
  const handleDone = useSaveOnClose(getCurrentPosition, onSave, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={handleDone}>
      <div
        className="relative max-h-[90vh] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-800">
            Drag the circle to move focus. This part of the image will stay centered.
          </p>
          <button
            type="button"
            onClick={handleDone}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
        <div
          ref={containerRef}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-drag-handle]")) return;
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const xc = Math.min(100, Math.max(0, x));
            const yc = Math.min(100, Math.max(0, y));
            setPosition({ x: xc, y: yc });
            onSave(toPosition(xc, yc));
          }}
        >
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ objectPosition: positionStr }}
            draggable={false}
          />
          <div
            role="button"
            tabIndex={0}
            data-drag-handle
            onPointerDown={handlePointerDown}
            className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-lg ring-2 ring-slate-900/30 active:cursor-grabbing"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            aria-label="Drag to set focus point"
          />
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          Position: {Math.round(position.x)}% × {Math.round(position.y)}%
        </p>
      </div>
    </div>
  );
}
