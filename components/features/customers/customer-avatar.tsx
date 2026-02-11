import { cn } from "@/lib/utils";

interface CustomerAvatarProps {
  initials: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomerAvatar({ initials, className, size = 'md' }: CustomerAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-primary/10 items-center justify-center font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {initials.substring(0, 2).toUpperCase()}
    </div>
  );
}
