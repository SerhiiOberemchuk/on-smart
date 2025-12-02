function CategorySkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[355px] w-full animate-pulse rounded bg-gray-800/40" />
      ))}
    </ul>
  );
}
export default CategorySkeleton;
