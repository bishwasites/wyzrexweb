export default function MetaAdsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="skeleton w-full rounded-[24px]" style={{ aspectRatio: "1200 / 1420" }} />
          <div className="skeleton mt-4 h-4 w-3/5 rounded-control" />
          <div className="skeleton mt-2 h-3.5 w-4/5 rounded-control" />
        </div>
      ))}
    </div>
  );
}
