"use client";

import { useState, useEffect } from "react";

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "P";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [errored, setErrored] = useState(false);

  // Reset error state if URL changes (e.g., user logs out + in with another account)
  useEffect(() => {
    setErrored(false);
  }, [avatarUrl]);

  const initials = getInitials(name);
  const showImage = !!avatarUrl && !errored;
  const sizeClass = SIZE_CLASS[size];

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center bg-emerald-500/10 ring-1 ring-emerald-500/20 ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name ? `Foto de perfil de ${name}` : "Foto de perfil"}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-emerald-700 dark:text-emerald-300 select-none">
          {initials}
        </span>
      )}
    </div>
  );
}
