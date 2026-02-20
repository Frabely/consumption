import "../styles/globals.css";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/store/provider";
import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import de from "@/constants/de.json";

config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: de.head.title,
  description: de.head.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: de.head.title,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1f2a26",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
