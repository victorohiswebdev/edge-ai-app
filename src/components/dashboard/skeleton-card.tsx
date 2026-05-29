export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-5">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="mt-3 h-8 w-28 rounded bg-muted" />
      <div className="mt-3 h-3 w-24 rounded bg-muted" />
    </div>
  );
}
