"use client";

import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RssiChartProps {
  data: Array<Record<string, string | number>>;
  networks: string[];
  className?: string;
}

const COLORS = [
  "oklch(0.7 0.25 300)",
  "oklch(0.75 0.15 195)",
  "oklch(0.75 0.2 145)",
  "oklch(0.7 0.2 350)",
];

export function RssiChart({ data, networks, className }: RssiChartProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.7_0.25_300/0.3)] bg-card/50 backdrop-blur-sm p-4",
        "shadow-[0_0_30px_oklch(0.7_0.25_300/0.1)]",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          Histórico de Sinal RSSI
        </h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Intensidade do sinal ao longo do tempo
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {networks.map((_, index) => (
                <linearGradient
                  key={index}
                  id={`gradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 300 / 0.5)" />
            <XAxis
              dataKey="time"
              stroke="oklch(0.6 0 0)"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              domain={[-100, -30]}
              stroke="oklch(0.6 0 0)"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0.015 280)",
                border: "1px solid oklch(0.7 0.25 300 / 0.3)",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)" }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: "10px",
              }}
            />
            {networks.map((network, index) => (
              <Area
                key={network}
                type="monotone"
                dataKey={network}
                stroke={COLORS[index % COLORS.length]}
                fill={`url(#gradient-${index})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
