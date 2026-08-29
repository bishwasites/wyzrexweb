export default function TopContentsSkeleton() {
  return (
    <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="skeleton aspect-[9/16] w-[78%] flex-shrink-0 snap-center rounded-[20px] sm:w-auto sm:flex-shrink sm:snap-align-none"
        />
      ))}
    </div>
  );
}
