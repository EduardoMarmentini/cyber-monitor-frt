"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "purple" | "cyan" | "green" | "pink";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "purple",
  className,
}: StatCardProps) {
  const variantStyles = {
    purple: {
      border: "border-[oklch(0.7_0.25_300/0.3)]",
      glow: "shadow-[0_0_30px_oklch(0.7_0.25_300/0.15)]",
      iconBg: "bg-[oklch(0.7_0.25_300/0.15)]",
      iconColor: "text-[oklch(0.7_0.25_300)]",
      valueColor: "text-[oklch(0.85_0.2_300)]",
    },
    cyan: {
      border: "border-[oklch(0.75_0.15_195/0.3)]",
      glow: "shadow-[0_0_30px_oklch(0.75_0.15_195/0.15)]",
      iconBg: "bg-[oklch(0.75_0.15_195/0.15)]",
      iconColor: "text-[oklch(0.75_0.15_195)]",
      valueColor: "text-[oklch(0.85_0.12_195)]",
    },
    green: {
      border: "border-[oklch(0.75_0.2_145/0.3)]",
      glow: "shadow-[0_0_30px_oklch(0.75_0.2_145/0.15)]",
      iconBg: "bg-[oklch(0.75_0.2_145/0.15)]",
      iconColor: "text-[oklch(0.75_0.2_145)]",
      valueColor: "text-[oklch(0.85_0.15_145)]",
    },
    pink: {
      border: "border-[oklch(0.7_0.2_350/0.3)]",
      glow: "shadow-[0_0_30px_oklch(0.7_0.2_350/0.15)]",
      iconBg: "bg-[oklch(0.7_0.2_350/0.15)]",
      iconColor: "text-[oklch(0.7_0.2_350)]",
      valueColor: "text-[oklch(0.85_0.15_350)]",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:scale-[1.02]",
        style.border,
        style.glow,
        className
      )}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scanline" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className={cn("text-3xl font-mono font-bold", style.valueColor)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-mono text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs font-mono">
              <span
                className={
                  trend.isPositive
                    ? "text-[oklch(0.75_0.2_145)]"
                    : "text-[oklch(0.6_0.25_25)]"
                }
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs last hour</span>
            </div>
          )}
        </div>

        <div className={cn("rounded-lg p-3", style.iconBg)}>
          <Icon className={cn("h-6 w-6", style.iconColor)} />
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-16 h-16">
        <div
          className={cn(
            "absolute top-2 right-2 w-2 h-2 rounded-full pulse-glow",
            style.iconColor
          )}
        />
      </div>
    </div>
  );
}
