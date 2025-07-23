import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { type Metadata } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";
import { Suspense } from "react";
import { extractRouterConfig } from "uploadthing/server";
import AuthOverlay from "../components/application/auth-overlay";
import { ourFileRouter } from "./api/uploadthing/core";

export const metadata: Metadata = {
  title: "Past Papers",
  description: "Past paper directory for university students",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const atlasGrotesk = localFont({
  src: [
    {
      path: "../fonts/atlas/AtlasGrotesk-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-ThinItalic.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/atlas/AtlasGrotesk-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
});

const tobias = localFont({
  src: [
    {
      path: "../fonts/tobias/Tobias-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/tobias/Tobias-Heavy.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-tobias",
});

async function UTSSR() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${tobias.variable} ${atlasGrotesk.className}`}>
      <body>
        <Suspense>
          <UTSSR />
        </Suspense>
        <TRPCReactProvider>
          <AuthOverlay />
          <Toaster />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
