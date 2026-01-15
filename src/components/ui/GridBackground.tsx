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
  // Lavender Dusk colors
  const colorValue =
    color === "accent"
      ? "rgba(105, 104, 166, 0.12)"  // Lavender
      : "rgba(152, 152, 168, 0.06)"; // Muted purple-gray

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

      {/* Fade overlay - Lavender Dusk dark background */}
      {fade && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 0%, #0a0a14 70%),
              linear-gradient(to bottom, transparent 60%, #0a0a14 100%)
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
      {/* Primary glow - Lavender */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(105, 104, 166, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Secondary glow - Rose */}
      <div
        className="absolute top-20 left-1/4 w-100 h-100 opacity-25"
        style={{
          background:
            "radial-gradient(circle at center, rgba(207, 152, 147, 0.5) 0%, transparent 60%)",
        }}
      />

      {/* Tertiary glow - Deep Teal */}
      <div
        className="absolute top-20 right-1/4 w-100 h-100 opacity-25"
        style={{
          background:
            "radial-gradient(circle at center, rgba(8, 80, 120, 0.5) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
