"use client";

import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChannelChartProps {
  data: Array<{ channel: number; networks: number }>;
  className?: string;
}

export function ChannelChart({ data, className }: ChannelChartProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.75_0.15_195/0.3)] bg-card/50 backdrop-blur-sm p-4",
        "shadow-[0_0_30px_oklch(0.75_0.15_195/0.1)]",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          Distribuição de Canais
        </h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Quantidade de redes por canal Wi-Fi
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 300 / 0.5)" />
            <XAxis
              dataKey="channel"
              stroke="oklch(0.6 0 0)"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              label={{
                value: "Canal",
                position: "bottom",
                style: { fill: "oklch(0.6 0 0)", fontSize: 10, fontFamily: "monospace" },
              }}
            />
            <YAxis
              stroke="oklch(0.6 0 0)"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0.015 280)",
                border: "1px solid oklch(0.75 0.15 195 / 0.3)",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)" }}
              formatter={(value) => [`${value} redes`, "Quantidade"]}
              labelFormatter={(label) => `Canal ${label}`}
            />
            <Bar dataKey="networks" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.networks >= 3
                      ? "oklch(0.6 0.25 25)"
                      : entry.networks >= 2
                      ? "oklch(0.75 0.15 80)"
                      : "oklch(0.75 0.15 195)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
