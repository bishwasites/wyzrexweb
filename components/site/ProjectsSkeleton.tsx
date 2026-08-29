export default function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[24px] border border-line bg-surface p-4">
          <div className="skeleton aspect-[5/3] w-full rounded-[24px]" />
          <div className="mt-4 flex items-center gap-3">
            <div className="skeleton h-10 w-14 rounded-control" />
            <div className="skeleton h-4 w-2/5 rounded-control" />
          </div>
          <div className="skeleton mt-3 h-3.5 w-4/5 rounded-control" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="skeleton h-[38px] w-[38px] rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
