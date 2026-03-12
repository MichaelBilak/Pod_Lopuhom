type ProductImagePlaceholderProps = {
  className?: string;
  "aria-label"?: string;
};

/** Shown when a product has no image. Keeps card layout consistent. */
export default function ProductImagePlaceholder({
  className = "",
  "aria-label": ariaLabel = "No image",
}: ProductImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 sm:h-16 sm:w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}
