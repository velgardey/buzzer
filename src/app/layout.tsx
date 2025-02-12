import "~/styles/globals.css";

import { Architects_Daughter } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

const architectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-architects-daughter",
});

export const metadata: Metadata = {
  title: "Buzzer - Interactive Quiz Platform",
  description: "Experience the thrill of interactive quizzes & compete with others!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${architectsDaughter.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
