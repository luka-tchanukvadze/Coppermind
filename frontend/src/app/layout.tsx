import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coppermind - Your private library",
  description: "Track your reading, keep your thoughts with the book, and talk books with friends who actually read them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background text-ink antialiased">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        {/* Sonner toaster mounted globally so toast() calls anywhere in the app render here.
            The "!" prefix on every classname is required because Sonner ships its own
            inline styles - without "!" they win over our Tailwind classes. */}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            classNames: {
              toast: "!bg-surface !border-border-strong !text-ink !shadow-lg",
              title: "!font-medium",
              description: "!text-muted",
              actionButton: "!bg-accent !text-white",
              cancelButton: "!bg-muted-bg !text-ink",
              success: "!text-success",
              error: "!text-error",
            },
          }}
        />
      </body>
    </html>
  );
}
