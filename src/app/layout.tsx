import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "拍貼秀 Personal - 活動照片即時分享",
  description: "自己用的活動照片即時分享工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
