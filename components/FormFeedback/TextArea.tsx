"use client";

import { useState } from "react";

const MAX_CHARS = 150;

export default function TextArea({
  id = "messaggio",
  name = "messaggio",
  label = "Messaggio*",
}: {
  id?: string;
  name?: string;
  label?: string;
}) {
  const [count, setCount] = useState(0);

  return (
    <label htmlFor={id} className="helper_text mt-5 flex flex-col">
      <span>{label}</span>
      <textarea
        id={id}
        name={name}
        required
        rows={4}
        maxLength={MAX_CHARS}
        className="h-24 resize-none"
        onChange={(event) => setCount(event.currentTarget.value.length)}
      />
      <span className="mt-1 ml-auto text-text-grey">
        {count}/{MAX_CHARS}
      </span>
    </label>
  );
}
