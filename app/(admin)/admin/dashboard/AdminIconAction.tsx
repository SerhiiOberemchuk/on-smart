"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type SharedProps = {
  icon: StaticImageData;
  activeIcon?: StaticImageData;
  isActive?: boolean;
  alt: string;
  className?: string;
  iconClassName?: string;
};

type LinkProps = SharedProps & {
  href: string;
  ariaLabel?: string;
  title?: string;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

function IconContent({
  icon,
  activeIcon,
  isActive,
  alt,
  iconClassName,
}: Pick<SharedProps, "icon" | "activeIcon" | "isActive" | "alt" | "iconClassName">) {
  return (
    <Image
      src={isActive && activeIcon ? activeIcon : icon}
      alt={alt}
      width={18}
      height={18}
      className={iconClassName}
      aria-hidden
    />
  );
}

export function AdminIconActionLink({
  href,
  icon,
  activeIcon,
  isActive,
  alt,
  ariaLabel,
  title,
  className,
  iconClassName,
}: LinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? alt}
      title={title ?? alt}
      className={twMerge("admin-icon-action", className)}
    >
      <IconContent
        icon={icon}
        activeIcon={activeIcon}
        isActive={isActive}
        alt={alt}
        iconClassName={iconClassName}
      />
    </Link>
  );
}

export function AdminIconActionButton({
  icon,
  activeIcon,
  isActive,
  alt,
  className,
  iconClassName,
  type = "button",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={rest["aria-label"] ?? alt}
      title={rest.title ?? alt}
      disabled={disabled}
      className={twMerge(
        "admin-icon-action",
        disabled && "cursor-not-allowed opacity-55",
        className,
      )}
    >
      <IconContent
        icon={icon}
        activeIcon={activeIcon}
        isActive={isActive}
        alt={alt}
        iconClassName={iconClassName}
      />
    </button>
  );
}
