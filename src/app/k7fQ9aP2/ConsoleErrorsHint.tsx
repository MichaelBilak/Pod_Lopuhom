"use client";

import { useState } from "react";

export default function ConsoleErrorsHint() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-800"
      role="note"
    >
      <span>
        Ошибки в консоли «Could not establish connection» и «Mapify» идут от расширений браузера, не от сайта. Чтобы их не видеть — отключите расширения на этой вкладке или игнорируйте.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-2 font-medium underline focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Скрыть подсказку"
      >
        Скрыть
      </button>
    </div>
  );
}
