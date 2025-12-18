import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/shared/Navbar";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { Toaster } from "react-hot-toast";
import 'react-loading-skeleton/dist/skeleton.css';

export const metadata: Metadata = {
  title: "Fixora - Home Services Platform",
  description: "Book trusted home service professionals for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
          <AuthProvider>
            <Toaster position="top-center" />
            <Navbar />
            <main>{children}</main>
            <ChatBubble />
          </AuthProvider>
      </body>
    </html>
  );
}
