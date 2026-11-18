import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { BRAND } from "@/lib/brand";

const display = Sora({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BRAND.name} : apprendre en s'amusant`,
  description: "Maths, physique-chimie, programmation, code de la route, langues et plus, en parcours ludiques de 5 minutes.",
};
export const viewport: Viewport = { themeColor: "#0b0706" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
