"use client";

import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DevicesHistoryChartProps {
  data: Array<{ time: string; wifi: number }>;
  className?: string;
}

export function DevicesHistoryChart({ data, className }: DevicesHistoryChartProps) {
  const hasData = data.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-[oklch(0.75_0.2_145/0.3)] bg-card/50 backdrop-blur-sm p-4",
        "shadow-[0_0_30px_oklch(0.75_0.2_145/0.1)]",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          Historico de Dispositivos
        </h3>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Dispositivos detectados ao longo do tempo
        </p>
      </div>

      <div className="h-[250px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 300 / 0.5)" />
              <XAxis
                dataKey="time"
                stroke="oklch(0.6 0 0)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
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
                  border: "1px solid oklch(0.75 0.2 145 / 0.3)",
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
              <Line
                type="monotone"
                dataKey="wifi"
                name="Redes Wi-Fi"
                stroke="oklch(0.7 0.25 300)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.7 0.25 300)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "oklch(0.85 0.2 300)" }}
              />
              {/* BLE desativado */}
              {/* <Line
                type="monotone"
                dataKey="ble"
                name="Dispositivos BLE"
                stroke="oklch(0.75 0.15 195)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.75 0.15 195)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: "oklch(0.85 0.12 195)" }}
              /> */}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="font-mono text-xs text-muted-foreground">
              Nenhum dado disponivel. Execute um scan para visualizar o historico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
