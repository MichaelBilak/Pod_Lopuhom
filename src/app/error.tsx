"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-base text-slate-700">
        Something went wrong while loading this page.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}
