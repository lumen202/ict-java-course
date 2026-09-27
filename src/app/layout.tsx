import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Java Course Hub",
    template: "%s · Java Course Hub",
  },
  description:
    "Weekly coursework for ICT Java: databases and SQL, JDBC, web pages with HTML, CSS and JavaScript, REST APIs with Spring Boot, and a final project of your own.",
};

// AppShell decides the frame: sidebar for signed-in users, bare page for the
// login and register screens.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // globals.css sets smooth scrolling; this tells Next 16 to switch it off
      // during route changes so navigation jumps straight to the new page.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
