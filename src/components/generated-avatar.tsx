import { createAvatar } from "@dicebear/core";
import { glass, initials } from "@dicebear/collection";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: "glass" | "initials";
}
export default function GeneratedAvatar({
  seed,
  variant,
  className,
}: GeneratedAvatarProps) {
  const avatar =
    variant === "glass"
      ? createAvatar(glass, {
          seed,
        })
      : createAvatar(initials, {
          seed,
          fontWeight: 500,
          fontSize: 42,
        });
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatar.toDataUri()} />
      <AvatarFallback delayMs={500}>
        {seed.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
