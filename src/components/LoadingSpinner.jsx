export default function LoadingSpinner({ size = "md", label = "Loading…" }) {
  const sizes = { sm: "h-5 w-5 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-4" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-label={label}>
      <div className={`${sizes[size]} animate-spin rounded-full border-indigo-500 border-t-transparent`} />
      <span className="text-slate-500 text-sm">{label}</span>
    </div>
  );
}
