"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  label: string;
};

export default function BackButton({ label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded"
    >
      {label}
    </button>
  );
}
