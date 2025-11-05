"use client";

import { Tooltip } from "react-tooltip";

export default function TitleTooltip({ id }: { id: string }) {
  return (
    <Tooltip
      id={id}
      place="top"
      style={{
        maxWidth: 250,
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    />
  );
}
