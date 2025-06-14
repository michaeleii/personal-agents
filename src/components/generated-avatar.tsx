import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn, generateAvatarURI, type AvatarVariants } from "@/lib/utils";

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant: AvatarVariants;
}
export default function GeneratedAvatar({
  seed,
  variant,
  className,
}: GeneratedAvatarProps) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={generateAvatarURI(variant, seed)} />
      <AvatarFallback delayMs={500}>
        {seed.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
