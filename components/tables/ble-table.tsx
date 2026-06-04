// ─── BLE desativado (Arduino limitado) ────────────────────────
// "use client";
//
// import { cn } from "@/lib/utils";
// import type { BleDevice } from "@/types/ble";
// import { Bluetooth, Signal } from "lucide-react";
//
// interface BleTableProps {
//   devices: BleDevice[];
//   className?: string;
// }
//
// function getSignalStrength(rssi: number): { label: string; color: string } {
//   if (rssi >= -50) return { label: "Próximo", color: "text-[oklch(0.75_0.2_145)]" };
//   if (rssi >= -65) return { label: "Médio", color: "text-[oklch(0.75_0.15_195)]" };
//   return { label: "Distante", color: "text-[oklch(0.6_0.25_25)]" };
// }
//
// function formatTimeSince(timestamp: number): string {
//   const seconds = Math.floor((Date.now() - timestamp) / 1000);
//   if (seconds < 60) return `${seconds}s atrás`;
//   const minutes = Math.floor(seconds / 60);
//   if (minutes < 60) return `${minutes}m atrás`;
//   const hours = Math.floor(minutes / 60);
//   return `${hours}h atrás`;
// }
//
// export function BleTable({ devices, className }: BleTableProps) {
//   return (
//     <div
//       className={cn(
//         "rounded-lg border border-[oklch(0.75_0.15_195/0.3)] bg-card/50 backdrop-blur-sm overflow-hidden",
//         "shadow-[0_0_30px_oklch(0.75_0.15_195/0.1)]",
//         className
//       )}
//     >
//       <div className="p-4 border-b border-border/50">
//         <div className="flex items-center gap-2">
//           <Bluetooth className="h-5 w-5 text-[oklch(0.75_0.15_195)]" />
//           <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
//             Dispositivos BLE Detectados
//           </h3>
//           <span className="ml-auto px-2 py-0.5 text-xs font-mono bg-[oklch(0.75_0.15_195/0.2)] text-[oklch(0.85_0.12_195)] rounded">
//             {devices.length} encontrados
//           </span>
//         </div>
//       </div>
//
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-border/30 bg-muted/30">
//               <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
//                 Nome
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
//                 MAC
//               </th>
//               <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-wider text-muted-foreground">
//                 RSSI
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
//                 Fabricante
//               </th>
//               <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-muted-foreground">
//                 Visto
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {devices.map((device, index) => {
//               const signal = getSignalStrength(device.rssi);
//
//               return (
//                 <tr
//                   key={device.mac}
//                   className={cn(
//                     "border-b border-border/20 transition-colors hover:bg-[oklch(0.75_0.15_195/0.05)]",
//                     index % 2 === 0 && "bg-muted/10"
//                   )}
//                 >
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Bluetooth className="h-4 w-4 text-[oklch(0.75_0.15_195)]" />
//                       <span className="font-mono text-sm font-medium">
//                         {device.name || "Desconhecido"}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <code className="text-xs font-mono text-muted-foreground">{device.mac}</code>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex flex-col items-center gap-1">
//                       <Signal className={cn("h-4 w-4", signal.color)} />
//                       <span className={cn("text-xs font-mono", signal.color)}>
//                         {device.rssi} dBm
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className="px-2 py-0.5 text-xs font-mono bg-secondary rounded">
//                       {device.manufacturer || "N/A"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <span className="text-xs font-mono text-muted-foreground">
//                       {formatTimeSince(device.lastSeen)}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
