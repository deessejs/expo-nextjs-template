import "./globals.css"
import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Deesse Dashboard",
  description: "Expo + Next.js full stack starter",
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
