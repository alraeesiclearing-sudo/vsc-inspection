import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مركز سلامة المركبات - المنصة الموحدة",
  description: "المنصة الموحدة لمواعيد الفحص الفني الدوري للمركبات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif", backgroundColor: "#f7f8fa" }}>
        {children}
      </body>
    </html>
  );
}
