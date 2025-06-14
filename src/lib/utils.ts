import { glass, initials } from "@dicebear/collection";
import { createAvatar, type Result } from "@dicebear/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AvatarVariants = "glass" | "initials";

export const generateAvatarURI = (variant: AvatarVariants, seed: string) => {
  const avatarMap: Record<AvatarVariants, Result> = {
    glass: createAvatar(glass, {
      seed,
    }),
    initials: createAvatar(initials, {
      seed,
      fontWeight: 500,
      fontSize: 42,
    }),
  };
  return avatarMap[variant].toDataUri();
};
