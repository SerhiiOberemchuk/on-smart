"use client";

import { FilterGroup } from "@/types/catalog-filter-options.types";
import { Range } from "react-range";

import { useEffect, useState } from "react";
import {
  //  debounce,
  parseAsArrayOf,
  parseAsInteger,
  useQueryState,
} from "nuqs";

export function InputRange({
  min = 0,
  max = 100,
  param,
}: Pick<FilterGroup, "min" | "max"> & Pick<FilterGroup, "param">) {
  const safeMin = min ?? 0;
  const safeMax = max ?? 999999;

  const [range, setRange] = useQueryState(
    param,
    parseAsArrayOf(parseAsInteger).withDefault([safeMin, safeMax]),
  );

  const [values, setValues] = useState(range);

  useEffect(() => {
    const update = () => {
      if (range && range.length === 2) setValues(range);
    };
    update();
  }, [range]);

  const normalizeRange = (next: number[]) => {
    const from = Math.max(safeMin, Math.min(next[0], safeMax));
    const to = Math.max(from, Math.min(next[1], safeMax));
    return [from, to];
  };

  const update = (v: number[]) => {
    const normalized = normalizeRange(v);
    setValues(normalized);
    setRange(normalized, { scroll: false, shallow: false });
  };
  return (
    <div className="flex flex-col gap-3 overflow-x-visible pb-2">
      <div className="flex items-center justify-between">
        <input
          type="number"
          value={values[0]}
          className="h-11 w-24 rounded-sm border border-text-grey"
          onChange={(e) => update([+e.target.value, values[1]])}
          min={safeMin}
          max={values[1]}
        />
        <span>{" - "}</span>
        <input
          className="h-11 w-24 rounded-sm border border-text-grey"
          type="number"
          value={values[1]}
          min={values[0]}
          max={safeMax}
          onChange={(e) => update([values[0], +e.target.value])}
        />
      </div>
      <Range
        step={1}
        min={safeMin}
        max={safeMax}
        values={values}
        onChange={(v) => setValues(v)}
        onFinalChange={(v) => update(v)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="mx-auto h-1 w-[90%] overflow-x-visible rounded bg-stroke-grey px-1"
          >
            <div
              style={{
                position: "absolute",
                height: "100%",
                background: "#00a63e",
                borderRadius: "inherit",
                left: `${((values[0] - safeMin) / (safeMax - safeMin)) * 100}%`,
                width: `${((values[1] - values[0]) / (safeMax - safeMin)) * 100}%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div {...props} key={props.key} className="h-4 w-4 rounded-full bg-green-600 px-1" />
        )}
      />
    </div>
  );
}
