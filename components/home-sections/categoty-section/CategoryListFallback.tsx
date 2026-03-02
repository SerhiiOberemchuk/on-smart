import styles from "./category.module.css";

export default function CategoryListFallback() {
  return (
    <ul className={styles.list} aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <li
          key={`category-list-fallback-${index}`}
          className="relative overflow-hidden rounded-sm border border-neutral-200/70"
        >
          <div className="h-[180px] animate-pulse bg-neutral-200/80 md:h-[220px]" />
        </li>
      ))}
    </ul>
  );
}
