import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { LayoutProps } from "@/lib/types";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | ניהול הוצאות",
    default: "מערכת ניהול חשבוניות והוצאות",
  },
  description: "מערכת לניהול חשבוניות והוצאות לעסק - העלאת חשבוניות, ניתוח אוטומטי וסיווג הוצאות",
};

const RootLayout = (props: LayoutProps) => {
  const { children } = props
  return (
    <html lang="he" dir="rtl">
      <body suppressHydrationWarning className={cn(inter.variable, "antialiased")}>
        <AuthProvider>
        {children}
          <Toaster position="top-center" dir="rtl" richColors />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
