import { cn } from "./utils";
import { type HTMLAttributes } from "react";

interface GridBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "dots" | "lines" | "both";
  fade?: boolean;
  color?: "accent" | "muted";
}

export function GridBackground({
  className,
  variant = "lines",
  fade = true,
  color = "accent",
  children,
  ...props
}: GridBackgroundProps) {
  const colorValue =
    color === "accent"
      ? "rgba(59, 130, 246, 0.08)"
      : "rgba(156, 163, 175, 0.05)";

  const getPattern = () => {
    switch (variant) {
      case "dots":
        return {
          backgroundImage: `radial-gradient(${colorValue} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        };
      case "lines":
        return {
          backgroundImage: `
            linear-gradient(to right, ${colorValue} 1px, transparent 1px),
            linear-gradient(to bottom, ${colorValue} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        };
      case "both":
        return {
          backgroundImage: `
            radial-gradient(${colorValue} 1px, transparent 1px),
            linear-gradient(to right, ${colorValue} 1px, transparent 1px),
            linear-gradient(to bottom, ${colorValue} 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
        };
    }
  };

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={getPattern()}
      />

      {/* Fade overlay */}
      {fade && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 0%, #030712 70%),
              linear-gradient(to bottom, transparent 60%, #030712 100%)
            `,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HeroGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {/* Primary glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
        }}
      />

      {/* Secondary glows */}
      <div
        className="absolute top-20 left-1/4 w-100 h-100 opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139, 92, 246, 0.4) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-20 right-1/4 w-100 h-100 opacity-20"
        style={{
          background:
            "radial-gradient(circle at center, rgba(6, 182, 212, 0.4) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
