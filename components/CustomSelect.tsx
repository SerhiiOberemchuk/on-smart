"use client";

import { useEffect, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export type CustomSelectOption = { value: string; label: string };

const VARIANT_CLASS = {
  underline: "border-b border-stroke-grey py-1",
  box: "rounded-sm border border-stroke-grey bg-background px-3 py-2 text-sm",
} as const;

/**
 * Dark, on-brand replacement for a native <select>.
 * - Form mode: pass `name` (+ optional `defaultValue`) — submits via a hidden
 *   input, so it is a drop-in inside a <form> / server action.
 * - Controlled mode: pass `value` + `onChange`.
 */
export function CustomSelect({
  name,
  options,
  defaultValue = "",
  value: controlledValue,
  onChange,
  placeholder = "Seleziona...",
  variant = "underline",
  className,
  buttonClassName,
}: {
  name?: string;
  options: CustomSelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: keyof typeof VARIANT_CLASS;
  className?: string;
  buttonClassName?: string;
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  const open = () => {
    setActiveIndex(options.findIndex((o) => o.value === value));
    setIsOpen(true);
  };

  const commit = (v: string) => {
    if (isControlled) onChange?.(v);
    else setInternalValue(v);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) return open();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) return open();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) return open();
        if (activeIndex >= 0) commit(options[activeIndex].value);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={twMerge("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleKeyDown}
        className={twMerge(
          "flex w-full items-center justify-between gap-2 text-left text-text-grey outline-0 transition-colors",
          VARIANT_CLASS[variant],
          isOpen ? "border-yellow-500" : "hover:border-grey focus:border-yellow-500",
          buttonClassName,
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={twMerge(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        id={listId}
        role="listbox"
        className={twMerge(
          "absolute left-0 top-full z-50 mt-1 w-full overflow-auto rounded-sm border border-stroke-grey bg-grey-hover-stroke shadow-lg transition-all duration-200",
          isOpen
            ? "max-h-72 opacity-100"
            : "pointer-events-none max-h-0 border-transparent opacity-0",
        )}
      >
        {options.map((option, i) => {
          const isSelected = option.value === value;
          const isActive = i === activeIndex;
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => commit(option.value)}
              className={twMerge(
                "cursor-pointer px-3 py-2 text-sm transition-colors",
                isActive ? "bg-stroke-grey text-white" : "text-text-grey",
                isSelected && "text-yellow-400",
              )}
            >
              {option.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
