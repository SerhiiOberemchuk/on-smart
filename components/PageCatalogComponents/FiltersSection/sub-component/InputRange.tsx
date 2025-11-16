"use client";

import { FilterGroup } from "@/types/catalog-filter-options.types";
import { Range } from "react-range";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function InputRange({
  min = 0,
  max = 100,
  param,
}: Pick<FilterGroup, "min" | "max"> & Pick<FilterGroup, "param">) {
  const [values, setValues] = useState([min, max]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const checkedInitially = () => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(param)?.split("-").filter(Boolean) || [];
      if (current && current.length === 0) {
        setValues([min, max]);
        return;
      }
      setValues([Number(current[0]), Number(current[1])]);
    };
    checkedInitially();
  }, [param, searchParams, min, max]);

  const updateUrl = (v: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, `${v[0]}-${v[1]}`);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 overflow-x-visible pb-2">
      <div className="flex items-center justify-between">
        <input
          type="number"
          value={values[0]}
          className="h-11 w-24 rounded-sm border border-text-grey"
          onChange={(e) => {
            const newMin = +e.target.value;
            const newVals = [newMin, values[1]];
            setValues(newVals);
            updateUrl(newVals);
          }}
          max={max}
        />
        <span>{" - "}</span>
        <input
          className="h-11 w-24 rounded-sm border border-text-grey"
          type="number"
          value={values[1]}
          max={max}
          onChange={(e) => {
            const newMax = +e.target.value;
            const newVals = [values[0], newMax];
            setValues(newVals);
            updateUrl(newVals);
          }}
        />
      </div>
      <Range
        step={1}
        min={min}
        max={max}
        values={values}
        onFinalChange={(v) => {
          updateUrl(v);
        }}
        onChange={(v) => {
          setValues(v);
        }}
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
                left: `${((values[0] - min) / (max - min)) * 100}%`,
                width: `${((values[1] - values[0]) / (max - min)) * 100}%`,
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
