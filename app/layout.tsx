import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ESP32Provider } from "@/contexts/esp32-context";
import { ScanProvider } from "@/contexts/scan-context";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CYBER.MONITOR | Network Monitor",
  description: "Dashboard de monitoramento de redes Wi-Fi em tempo real",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/cyber-monitor-logo.ico",
      }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark bg-background">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ESP32Provider>
          <ScanProvider>
            <div className="min-h-screen bg-background cyber-grid">
              <Sidebar />
              <main className="pl-64 transition-all duration-300">
                <Navbar />
                {children}
              </main>
            </div>
          </ScanProvider>
        </ESP32Provider>
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
