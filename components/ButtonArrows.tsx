"use client";

import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ArrowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: "left" | "right";
};

export function ButtonArrow({ direction, className, ...rest }: ArrowButtonProps) {
  return (
    <button type="button" {...rest} className={twMerge("h-12 w-12 cursor-pointer", className)}>
      {direction === "left" ? (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M27.2832 28.6924L20.8066 22.3574L20.4404 22L20.8066 21.6426L27.2842 15.3086L26.6611 14.6992L19.7207 21.4844L19.7197 21.4854L19.626 21.5957C19.5986 21.6354 19.5754 21.6776 19.5566 21.7217C19.5193 21.8095 19.5 21.9036 19.5 21.998C19.5 22.0925 19.5192 22.1865 19.5566 22.2744C19.594 22.3623 19.6495 22.4425 19.7197 22.5107L19.7207 22.5127L26.6611 29.3008L27.2832 28.6924Z"
            fill="#FFB939"
            stroke="#FFB939"
          />
        </svg>
      ) : (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.7168 28.6924L26.1934 22.3574L26.5596 22L26.1934 21.6426L19.7158 15.3086L20.3389 14.6992L27.2793 21.4844L27.2803 21.4854L27.374 21.5957C27.4014 21.6354 27.4246 21.6776 27.4434 21.7217C27.4807 21.8095 27.5 21.9036 27.5 21.998C27.5 22.0925 27.4808 22.1865 27.4434 22.2744C27.406 22.3623 27.3505 22.4425 27.2803 22.5107L27.2793 22.5127L20.3389 29.3008L19.7168 28.6924Z"
            fill="#FFB939"
            stroke="#FFB939"
          />
        </svg>
      )}
    </button>
  );
}
