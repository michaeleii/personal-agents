import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Agents",
  description: "Meet with Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <html lang="en">
        <body className={cn(manrope.className, "antialiased")}>{children}</body>
      </html>
    </TRPCReactProvider>
  );
}
