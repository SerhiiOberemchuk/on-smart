"use client";

import { useState } from "react";

const maxChars = 150;

export default function TextArea() {
  const [count, setCount] = useState(0);
  return (
    <>
      <label htmlFor="messaggio" className="helper_text mt-5 flex flex-col">
        <span>Messaggio*</span>
        <textarea
          onChange={(e) => setCount(e.currentTarget.value.length)}
          id="messaggio"
          className="h-24 resize-none"
          maxLength={maxChars}
          name="messaggio"
          required
          rows={4}
        />
        <span className="mt-1 ml-auto text-text-grey">
          {count}/{maxChars}
        </span>
      </label>
    </>
  );
}
